<<<<<<< HEAD
// src/front/pages/Account.jsx
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Account = () => {
    const { store } = useGlobalReducer();
    const { session } = store;

    const token = session?.token ?? null;
    const firstName = session?.user?.first_name ?? "Guest";
=======
import React, { useEffect, useMemo, useRef, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

/* -------------------- EXPLICIT PHOTO IMPORTS -------------------- */
import AndresPhoto from "../assets/img/Andres.jpg";
import AnoukPhoto from "../assets/img/Anouk.jpg";
import CarolinePhoto from "../assets/img/Caroline.jpg";
import DanielPhoto from "../assets/img/Daniel.jpg";
import DiegoPhoto from "../assets/img/Diego.jpg";
import HoucinePhoto from "../assets/img/Houcine.jpg";
import JessicaPhoto from "../assets/img/Jessica.jpg";
import JianyanPhoto from "../assets/img/Jianyan.jpg";
import KsanaPhoto from "../assets/img/Ksana.jpg";
import LuisPhoto from "../assets/img/Luis.jpg";
import NykealahPhoto from "../assets/img/Nykealah.jpg";
import OluyinkaPhoto from "../assets/img/Oluyinka.jpg";
import RebecaPhoto from "../assets/img/Rebeca.jpg";
import SieversPhoto from "../assets/img/Sievers.jpg";
>>>>>>> origin

const IMAGES = {
  andres: AndresPhoto,
  anouk: AnoukPhoto,
  caroline: CarolinePhoto,
  daniel: DanielPhoto,
  diego: DiegoPhoto,
  houcine: HoucinePhoto,
  jessica: JessicaPhoto,
  jianyan: JianyanPhoto,
  ksana: KsanaPhoto,
  luis: LuisPhoto,
  nykealah: NykealahPhoto,
  oluyinka: OluyinkaPhoto,
  rebeca: RebecaPhoto,
  sievers: SieversPhoto,
};

/* -------------------- HELPERS -------------------- */

<<<<<<< HEAD
    // Guard: no token means show login redirect UI
    if (!token) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="min-vh-100 d-flex flex-column bg-light">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    <span className="navbar-brand">YourApp</span>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#accNavbar"
                        aria-controls="accNavbar"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>

                    <div className="collapse navbar-collapse" id="accNavbar">
                        <ul className="navbar-nav ms-auto align-items-lg-center gap-2">
                            <li className="nav-item">
                                <button type="button" className="btn btn-outline-light btn-sm">
                                    Account settings
                                </button>
                            </li>
                            <li className="nav-item">
                                <button type="button" className="btn btn-primary btn-sm">
                                    Account settings
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Main */}
            <main className="container flex-grow-1 py-5">
                <h1 className="display-6 text-center mb-4">Welcome {firstName}</h1>

                <div className="row justify-content-center">
                    <div className="col-12 col-lg-10">
                        <div className="card shadow-sm border-0">
                            <div className="row g-0">
                                {/* Image left */}
                                <div className="col-md-5">
                                    <img
                                        src={listing.image_url}
                                        alt="Property"
                                        className="img-fluid h-100 w-100 object-fit-cover rounded-start"
                                        style={{ minHeight: 240 }}
                                    />
                                </div>

                                {/* Details right */}
                                <div className="col-md-7">
                                    <div className="card-body">
                                        <h5 className="card-title mb-2">{listing.name}</h5>
                                        <p className="card-text mb-1">{listing.street}</p>
                                        <p className="card-text mb-1">
                                            {listing.city}, {listing.state}
                                        </p>
                                        <p className="card-text text-muted">Guest: {listing.guest_name}</p>

                                        {/* Welcome message */}
                                        <div className="mb-2">
                                            <label htmlFor="welcomeMessage" className="form-label">
                                                Personalized welcome
                                            </label>
                                            <textarea
                                                id="welcomeMessage"
                                                className="form-control"
                                                rows={4}
                                                value={welcomeMsg}
                                                onChange={(e) => setWelcomeMsg(e.target.value)}
                                                placeholder="Leave a personalized welcome for your guest"
                                            />
                                        </div>

                                        <div className="d-flex gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={() => alert("Welcome message saved (demo).")}
                                            >
                                                Save message
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => setWelcomeMsg("")}
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {/* /right */}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
=======
function extractGuestName(eventTitle) {
  if (!eventTitle) return "";
  const cleaned = String(eventTitle).trim();
  const patterns = [/^Reserved\s*[-–—]\s*/i, /^Reserva(do|da)?\s*[-–—]\s*/i];
  let name = cleaned;
  for (const p of patterns) name = name.replace(p, "");
  return name.trim();
>>>>>>> origin
}

function normalizeKey(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function fmtDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

function toDriveDirect(url) {
  if (!url) return null;
  const m1 = url.match(/https?:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/i);
  if (m1) return `https://drive.google.com/uc?export=view&id=${m1[1]}`;
  const m2 = url.match(/https?:\/\/drive\.google\.com\/open\?id=([^&]+)/i);
  if (m2) return `https://drive.google.com/uc?export=view&id=${m2[1]}`;
  const m3 = url.match(/https?:\/\/drive\.google\.com\/uc\?(?:export=\w+&)?id=([^&]+)/i);
  if (m3) return `https://drive.google.com/uc?export=view&id=${m3[1]}`;
  return null;
}

const CARD_HEIGHT = 180; // unified height for image + content

export const Account = () => {
  const { store } =
    (typeof useGlobalReducer === "function" ? useGlobalReducer() : { store: {} }) || { store: {} };

  const token = store?.token ?? true;
  const email = store?.user?.email ?? "Guest";

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const url = `${API_BASE}/calendar/reserved?tz=America/New_York`;
    fetch(url)
      .then(async (r) => {
        const txt = await r.text();
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${txt.slice(0, 200)}`);
        try {
          return JSON.parse(txt);
        } catch {
          throw new Error(`Expected JSON, got: ${txt.slice(0, 120)}`);
        }
      })
      .then((data) => {
        setReservations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((e) => {
        setErr(e.message);
        setLoading(false);
      });
  }, []);

  const items = useMemo(
    () =>
      reservations.map((r) => {
        const title = r.title || r.event;
        const guestName = extractGuestName(title);
        const keyName = normalizeKey(guestName);

        const imported = IMAGES[keyName];
        const backendImg = (r.image && r.image.trim()) || null;
        const directFromReservation = toDriveDirect(r.reservation_url || "");
        const imageSrc =
          imported ||
          backendImg ||
          (directFromReservation && directFromReservation.trim()) ||
          "https://picsum.photos/seed/guest/600/400";

        const checkinDate = r.checkin ? new Date(r.checkin) : null;
        const checkoutDate = r.checkout ? new Date(r.checkout) : null;

        return {
          key: r.event || crypto.randomUUID(),
          guestName,
          checkinText: fmtDate(r.checkin),
          checkoutText: fmtDate(r.checkout),
          checkinDate,
          checkoutDate,
          image: imageSrc,
        };
      }),
    [reservations]
  );

  // Helpers for date window checks
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayEnd = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);

  const isCurrent = (ci, co) =>
    ci && co && todayStart <= co && todayEnd >= ci; // inclusive window
  const isPast = (co) => co && co < todayStart;

  // Find current/next card index for initial scroll
  const currentIndex = useMemo(() => {
    if (!items.length) return 0;
    const cur = items.findIndex((it) => isCurrent(it.checkinDate, it.checkoutDate));
    if (cur !== -1) return cur;
    const upcoming = items.findIndex((it) => it.checkinDate && it.checkinDate > todayEnd);
    return upcoming !== -1 ? upcoming : 0;
  }, [items, todayEnd, todayStart]);

  const listRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    if (!listRef.current || !cardRefs.current[currentIndex]) return;
    cardRefs.current[currentIndex].scrollIntoView({ block: "start" });
  }, [currentIndex, items.length]);

  if (!token) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center p-4">
          <h1 className="h4 mb-2">Not authorized</h1>
        </div>
      </div>
    );
  }

  return (
    // Lock outer page scroll; only the list scrolls
    <div
      className="bg-light"
      style={{ position: "fixed", inset: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      <main className="container py-4 d-flex flex-column" style={{ flex: 1, minHeight: 0 }}>
        {/* Top-right logo */}
        <div className="d-flex justify-content-end">
          <span className="navbar-brand mb-0 h1">
            WhiteGlove <span className="text-primary">BnB</span>
          </span>
        </div>

        <h1 className="h4 mb-3">Welcome {email}</h1>

        <div className="d-flex align-items-center justify-content-between">
          <h2 className="h5 mb-0">Here are your upcoming reservations...</h2>
          {loading && <span className="text-muted small">Loading…</span>}
          {err && <span className="text-danger small">Error: {err}</span>}
        </div>

        {/* Scrollable list — with top gap + scroll padding to prevent overlap */}
        <div
          ref={listRef}
          className="row g-3 mx-0 mt-3"
          style={{
            flex: 1,
            overflowY: "auto",
            paddingRight: 4,
            minHeight: 0,
            paddingTop: 16,
            scrollPaddingTop: 16,
          }}
        >
          {items.map((it, idx) => {
            const shaded = isPast(it.checkoutDate);               // old reservations look lighter
            const showCurrent = isCurrent(it.checkinDate, it.checkoutDate); // badge only when hosting now

            return (
              <div
                key={it.key}
                ref={(el) => (cardRefs.current[idx] = el)}
                className="col-12 d-flex justify-content-center"
                style={{ scrollMarginTop: 16 }}
              >
                <div
                  className={`card shadow-sm border-0 w-100 ${shaded ? "opacity-50" : ""}`}
                  style={{ maxWidth: 900, height: CARD_HEIGHT, position: "relative" }}
                >
                  {/* Badge: top-right inside the card */}
                  {showCurrent && (
                    <span className="badge bg-success position-absolute top-0 end-0 m-2">
                      Currently hosting
                    </span>
                  )}

                  <div className="row g-0 h-100">
                    {/* Left image pane */}
                    <div className="col-5 col-sm-4 col-md-3 d-flex h-100 overflow-hidden">
                      <img
                        src={it.image}
                        alt="Guest"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        className="rounded-start"
                      />
                    </div>

                    {/* Right content pane */}
                    <div className="col-7 col-sm-8 col-md-9 d-flex h-100">
                      <div className="card-body d-flex flex-column justify-content-start w-100 overflow-hidden">
                        <h5 className="card-title mb-2 text-truncate">
                          {it.guestName || "(No name in event)"}
                        </h5>

                        <div className="mb-1 small">
                          <strong>Check-in:</strong> {it.checkinText || "—"}
                        </div>
                        <div className="mb-2 small">
                          <strong>Check-out:</strong> {it.checkoutText || "—"}
                        </div>

                        <input
                          type="text"
                          className="form-control form-control-sm text-muted"
                          placeholder="write your personalized note here"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {!loading && items.length === 0 && !err && (
            <div className="col-12 d-flex justify-content-center">
              <div className="alert alert-info mb-0 w-100" style={{ maxWidth: 900 }}>
                No reservations found.
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Account;