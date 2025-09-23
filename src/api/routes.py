from __future__ import annotations

import os
import re
import pytz
import requests
from datetime import datetime, date, timedelta, timezone
from typing import List, Dict, Any
from flask import Blueprint, current_app, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from sqlalchemy import select
from icalendar import Calendar

from api.models import db, User, Listing, Booking

api = Blueprint("api", __name__)
CORS(api, supports_credentials=True, origins="*")

# -----------------------------
# Auth endpoints (simple demo)
# -----------------------------

@api.route("/token", methods=["POST"])
def create_token():
    email = request.json.get("email")
    password = request.json.get("password")
    user = User.query.filter_by(email=email, password=password).first()
    if user is None:
        return jsonify({"msg": "Bad email or password"}), 401
    access_token = create_access_token(identity=user.id)
    return jsonify({"token": access_token, "user_id": user.id})

@api.route('/reset-password', methods=['POST'])
def reset_password():
    # Expect JSON: { "email": "user@email.com", "new_password": "NewStrongPass123!" }
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    new_password = (data.get("new_password") or "").strip()

    if not email or not new_password:
        return jsonify({"error": "email_and_new_password_required"}), 400
    if len(new_password) < 8:
        return jsonify({"error": "password_too_short"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "user_not_found"}), 404

    user.password = generate_password_hash(new_password)     
    db.session.commit()
    return jsonify({"ok": True}), 200

@api.route("/signup", methods=["POST"])
def signup():
    email = request.json.get("email")
    password = request.json.get("password")
    favorite_pet = request.json.get("pet")

    existing_user = User.query.filter_by(email=email).first()
    if existing_user is not None:
        return jsonify({"msg": "User already exists"}), 409

    new_user = User(email=email, password=password, security_question=favorite_pet, is_active=True)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User created successfully"}), 201

@api.route("/login", methods=["POST"])
def login():
    email = request.json.get("email")
    password = request.json.get("password")
    user = User.query.filter_by(email=email, password=password).first()
    if user is None:
        return jsonify({"msg": "Bad email or password"}), 401
    access_token = create_access_token(identity=user.id)
    return jsonify({"token": access_token, "user_id": user.id})

@api.route("/account", methods=["GET"])
@jwt_required()
def protect_account():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify({"id": user.id, "email": user.email}), 200

@api.route("/preview", methods=["GET"])
@jwt_required()
def protect_preview():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify({"id": user.id, "email": user.email}), 200

@api.route("/admin/users", methods=["GET"])
def list_all_users():
    """
    Get all users in the database. Requires authentication.
    Returns user info without sensitive data like passwords.
    """
    users = User.query.all()
    return jsonify({
        "total_users": len(users),
        "users": [user.serialize() for user in users]
    }), 200

@api.route("/hello", methods=["GET"])
def handle_hello():
    return jsonify({
        "message": "Hello! I'm a message that came from the backend. Check the network tab."
    }), 200

# -----------------------------
# Calendar (ICS) parsing + JSON exposure (Jose2 ENHANCED)
# -----------------------------

def _env(name: str, default: str | None = None) -> str | None:
    return os.environ.get(name, default)

RESERVATIONS_ICS_URL = _env("RESERVATIONS_ICS_URL") or (
    "https://calendar.google.com/calendar/ical/"
    "r2jpg8uh13234dsjiducroruahlv7i2r%40import.calendar.google.com/public/basic.ics"
)
DEFAULT_TZ = _env("DEFAULT_TIMEZONE", "America/New_York")

# --- URL helpers -------------------------------------------------------------
RE_URL = re.compile(r"(https?://[^\s)]+)", re.I)
RE_EXT_IMAGE = re.compile(r"\.(?:png|jpe?g|webp|gif)(?:\?.*)?$", re.I)
RE_DRIVE_FILE_VIEW = re.compile(r"https?://drive\.google\.com/file/d/([^/]+)/view(?:\?[^ ]*)?", re.I)
RE_DRIVE_OPEN = re.compile(r"https?://drive\.google\.com/open\?id=([^&]+)", re.I)
RE_DRIVE_UC = re.compile(r"https?://drive\.google\.com/uc\?(?:export=\w+&)?id=([^&]+)", re.I)

def to_direct_image_url(url: str) -> str:
    """
    Convert known providers (Google Drive) to a direct image URL.
    If it already looks like an image or a direct-drive link, return as-is/converted.
    """
    if not url:
        return url

    # Google Drive conversions
    m = RE_DRIVE_FILE_VIEW.search(url) or RE_DRIVE_OPEN.search(url) or RE_DRIVE_UC.search(url)
    if m:
        file_id = m.group(1)
        return f"https://drive.google.com/uc?export=view&id={file_id}"

    # Otherwise, if it looks like a normal image (by extension), return as is
    if RE_EXT_IMAGE.search(url):
        return url

    # Fallback: return original (may still work if server responds with image content-type)
    return url

# --- Datetime helpers --------------------------------------------------------

def _to_tz(dt, tzname: str):
    tz = pytz.timezone(tzname)
    if isinstance(dt, datetime):
        if dt.tzinfo is None:
            return tz.localize(dt)
        return dt.astimezone(tz)
    return tz.localize(datetime(dt.year, dt.month, dt.day, 0, 0, 0))

def _fix_all_day_checkout(start, end):
    if isinstance(start, datetime) or isinstance(end, datetime):
        return end
    return end - timedelta(days=1)

# --- Image extraction --------------------------------------------------------

def _first_image_from_vevent(vevent) -> str | None:
    """
    Extract an image URL from an event via:
      1) ATTACH property (may be one or many)
      2) Any URL in DESCRIPTION (first match)
    For Google Drive links, convert to a direct-view URL.
    """
    # 1) ATTACH
    attach = vevent.get("attach")
    if attach:
        cands = attach if isinstance(attach, list) else [attach]
        for a in cands:
            url = to_direct_image_url(str(a))
            if url:
                return url

    # 2) DESCRIPTION scan for any URL
    desc = str(vevent.get("description") or "")
    m = RE_URL.search(desc)
    if m:
        return to_direct_image_url(m.group(1))

    return None

# --- Core ICS parsing --------------------------------------------------------

def _fetch_reserved_rows(tzname: str = DEFAULT_TZ) -> List[Dict[str, Any]]:
    if not RESERVATIONS_ICS_URL:
        raise RuntimeError("RESERVATIONS_ICS_URL is not configured")

    resp = requests.get(RESERVATIONS_ICS_URL, timeout=30)
    resp.raise_for_status()
    cal = Calendar.from_ical(resp.content)

    rows: List[Dict[str, Any]] = []
    for vevent in cal.walk("vevent"):
        summary = str(vevent.get("summary") or "")
        if "reserved" not in summary.lower():
            continue

        uid = str(vevent.get("uid") or "").strip()
        if not uid:
            continue

        dtstart = vevent.get("dtstart") and vevent.get("dtstart").dt
        dtend = vevent.get("dtend") and vevent.get("dtend").dt
        if not dtstart or not dtend:
            continue

        start_local = _to_tz(dtstart, tzname)
        end_local = _to_tz(dtend, tzname)

        checkout_display = end_local
        if not isinstance(dtstart, datetime) and not isinstance(dtend, datetime):
            checkout_display = _to_tz(_fix_all_day_checkout(dtstart, dtend), tzname)

        desc = str(vevent.get("description") or "")
        m_url = RE_URL.search(desc)
        reservation_url = m_url.group(1) if m_url else None

        image_url = _first_image_from_vevent(vevent)

        rows.append({
            "event": uid,
            "title": summary.strip(),
            "checkin": start_local.isoformat(),
            "checkout": checkout_display.isoformat(),
            "reservation_url": reservation_url,
            "image": image_url,
        })
    rows.sort(key=lambda x: x["checkin"])
    return rows

@api.route("/calendar/reserved", methods=["GET"])
def calendar_reserved():
    tzname = request.args.get("tz") or DEFAULT_TZ
    try:
        rows = _fetch_reserved_rows(tzname)
        return jsonify(rows), 200
    except Exception as e:
        current_app.logger.exception("calendar_reserved failed: %s", e)
        return jsonify({"error": str(e)}), 500

# ------------------------------------------------
# Admin: sync ICS rows into DB as Booking records
# ------------------------------------------------

@api.route("/admin/sync-reserved", methods=["POST"])
def sync_reserved_to_db():
    """
    Upsert ICS 'Reserved' rows into bookings for a listing.
    Accepts JSON or query param: { "listing_id": 1 }
    Uses env RESERVATIONS_LISTING_ID if not provided.
    """
    listing_id = None
    if request.is_json:
        listing_id = request.json.get("listing_id")
    if not listing_id:
        listing_id = request.args.get("listing_id") or os.getenv("RESERVATIONS_LISTING_ID")

    if not listing_id:
        return jsonify({"error": "listing_id required"}), 400

    try:
        listing_id = int(listing_id)
    except Exception:
        return jsonify({"error": "listing_id must be an integer"}), 400

    # Ensure listing exists
    if not db.session.get(Listing, listing_id):
        return jsonify({"error": f"listing_id {listing_id} not found"}), 404

    rows = _fetch_reserved_rows()
    created = updated = 0

    for r in rows:
        uid = r["event"]
        ci = date.fromisoformat(r["checkin"][:10])
        co = date.fromisoformat(r["checkout"][:10])

        booking = db.session.execute(
            select(Booking).where(
                Booking.listing_id == listing_id,
                Booking.google_calendar_id == uid
            )
        ).scalar_one_or_none()

        if booking is None:
            booking = Booking(
                listing_id=listing_id,
                google_calendar_id=uid,
                needs_manual_details=True
            )
            db.session.add(booking)
            created += 1
        else:
            updated += 1

        booking.airbnb_checkin = ci
        booking.airbnb_checkout = co
        booking.reservation_url = r.get("reservation_url")
        booking.phone_last4 = r.get("phone_last4")
        booking.airbnb_guestpic_url = r.get("image")

    db.session.commit()
    return jsonify({"ok": True, "created": created, "updated": updated}), 200

# ------------------------------------------------
# Admin: manually punch guest names and profile pic
# ------------------------------------------------

@api.route("/admin/bookings/<int:booking_id>", methods=["PATCH"])
def admin_update_booking(booking_id: int):
    b = db.session.get(Booking, booking_id)
    if not b:
        return jsonify({"error": "not found"}), 404

    data = request.get_json(silent=True) or {}
    if "first_name" in data:
        b.airbnb_guest_first_name = (data["first_name"] or "").strip() or None
    if "last_name" in data:
        b.airbnb_guest_last_name = (data["last_name"] or "").strip() or None
    if "guestpic_url" in data:
        b.airbnb_guestpic_url = (data["guestpic_url"] or "").strip() or None
    if "listing_id" in data:
        try:
            new_listing_id = int(data["listing_id"])
            if db.session.get(Listing, new_listing_id):
                b.listing_id = new_listing_id
        except Exception:
            pass

    # Mark complete if both names are present (tweak rule as desired)
    if b.airbnb_guest_first_name and b.airbnb_guest_last_name:
        b.needs_manual_details = False

    db.session.commit()
    return jsonify(b.serialize()), 200

# -----------------------------
# Public bookings read API
# -----------------------------

@api.route("/bookings", methods=["GET"])
def list_bookings():
    """
    Optional filters:
      ?listing_id=1
      ?start=YYYY-MM-DD   (returns bookings whose checkout >= start)
      ?end=YYYY-MM-DD     (returns bookings whose checkin  <= end)
    """
    q = select(Booking)
    listing_id = request.args.get("listing_id")
    start = request.args.get("start")
    end = request.args.get("end")

    if listing_id:
        try:
            q = q.where(Booking.listing_id == int(listing_id))
        except Exception:
            return jsonify({"error": "listing_id must be an integer"}), 400
    if start:
        s = date.fromisoformat(start)
        q = q.where(Booking.airbnb_checkout >= s)
    if end:
        e = date.fromisoformat(end)
        q = q.where(Booking.airbnb_checkin <= e)

    items = db.session.execute(q).scalars().all()
    return jsonify([b.serialize() for b in items]), 200

# -----------------------------
# Restaurant endpoints
# -----------------------------

@api.route("/restaurants/nearby", methods=["GET"])
def get_nearby_restaurants():
    """Get nearby restaurants using Yelp API"""
    latitude = request.args.get('latitude')
    longitude = request.args.get('longitude')
    radius = request.args.get('radius', 5000)  # Default 5km radius

    if not latitude or not longitude:
        return jsonify({"error": "Latitude and longitude are required"}), 400

    yelp_api_key = os.getenv('YELP_API_KEY')
    if not yelp_api_key:
        return jsonify({"error": "Yelp API key not configured"}), 500

    headers = {
        'Authorization': f'Bearer {yelp_api_key}',
    }

    params = {
        'latitude': latitude,
        'longitude': longitude,
        'radius': radius,
        'categories': 'restaurants',
        'limit': 5,
        'sort_by': 'distance'
    }

    try:
        response = requests.get(
            'https://api.yelp.com/v3/businesses/search',
            headers=headers,
            params=params
        )

        if response.status_code == 200:
            data = response.json()
            return jsonify(data), 200
        else:
            return jsonify({"error": "Failed to fetch restaurants"}), response.status_code

    except Exception as e:
        return jsonify({"error": str(e)}), 500