from __future__ import annotations
from datetime import datetime, date
from typing import List, Optional
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import (
    String,
    Integer,
    Boolean,
    LargeBinary,
    ForeignKey,
    Date,
    DateTime,
    CheckConstraint,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
db = SQLAlchemy()
# ---- User -------------------------------------------------------------------
class User(db.Model):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Preserved original fields
    security_question: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True)
    jpeg: Mapped[Optional[bytes]] = mapped_column(LargeBinary, nullable=True)
    # Relationship (listings)
    listings: Mapped[List["Listing"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan"
    )
    def __repr__(self) -> str:
        return f"<User {self.id} {self.email}>"
    def serialize(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "is_active": self.is_active,
            "security_question": self.security_question,
        }
# ---- Listing ----------------------------------------------------------------
class Listing(db.Model):
    __tablename__ = "listings"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    street: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(
        String(1024), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Foreign Keys
    user_id: Mapped[int] = mapped_column(ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    current_booking_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("bookings.id", use_alter=True,
                   name="fk_listings_current_booking"),
        nullable=True
    )
    # Preserved original fields
    airbnb_address: Mapped[str] = mapped_column(String(255), nullable=False)
    airbnb_zipcode: Mapped[Optional[str]] = mapped_column(
        String(15), nullable=True)
    # Relationships
    owner: Mapped["User"] = relationship(back_populates="listings")
    bookings: Mapped[List["Booking"]] = relationship(
        back_populates="listing",
        foreign_keys="[Booking.listing_id]",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    current_booking: Mapped[Optional["Booking"]] = relationship(
        "Booking",
        foreign_keys="[Listing.current_booking_id]",
        post_update=True,
        viewonly=False,
        uselist=False,
    )
    def __repr__(self) -> str:
        return f"<Listing {self.id} {self.name or ''}>"
    def serialize(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "street": self.street,
            "city": self.city,
            "state": self.state,
            "image_url": self.image_url,
            "user_id": self.user_id,
            "current_booking_id": self.current_booking_id,
            "airbnb_address": self.airbnb_address,
            "airbnb_zipcode": self.airbnb_zipcode,
        }
# ---- Booking ----------------------------------------------------------------
class Booking(db.Model):
    __tablename__ = "bookings"
    id: Mapped[int] = mapped_column(primary_key=True)
    google_calendar_id: Mapped[Optional[str]] = mapped_column(
        String(255), index=True, nullable=True)
    # Fixed: Added proper ForeignKey constraint
    listing_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("listings.id", ondelete="CASCADE"),
        nullable=True
    )
    airbnb_guest_first_name: Mapped[Optional[str]
                                    ] = mapped_column(String(120), nullable=True)
    airbnb_guest_last_name: Mapped[Optional[str]
                                   ] = mapped_column(String(120), nullable=True)
    airbnb_checkin: Mapped[Optional[datetime]
                           ] = mapped_column(DateTime, nullable=True)
    airbnb_checkout: Mapped[Optional[datetime]
                            ] = mapped_column(DateTime, nullable=True)
    reservation_url: Mapped[Optional[str]] = mapped_column(
        String(1024), nullable=True)
    airbnb_guestpic_url: Mapped[Optional[str]] = mapped_column(
        String(1024), nullable=True)
    needs_manual_details: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Preserved original fields
    airbnb_guestpic: Mapped[Optional[bytes]] = mapped_column(
        LargeBinary, nullable=True)
    phone_last4: Mapped[Optional[str]] = mapped_column(
        String(4), nullable=True)
    # Relationships
    listing: Mapped[Optional["Listing"]] = relationship(
        back_populates="bookings",
        foreign_keys="[Booking.listing_id]"
    )
    __table_args__ = (
        CheckConstraint(
            "(airbnb_checkin IS NULL OR airbnb_checkout IS NULL) OR (airbnb_checkout >= airbnb_checkin)",
            name="ck_booking_checkout_after_checkin",
        ),
        UniqueConstraint("listing_id", "google_calendar_id",
                         name="uq_booking_listing_googleid"),
    )
    def __repr__(self) -> str:
        return f"<Booking {self.id} {self.google_calendar_id or ''}>"
    def serialize(self) -> dict:
        return {
            "id": self.id,
            "google_calendar_id": self.google_calendar_id,
            "listing_id": self.listing_id,
            "airbnb_guest_first_name": self.airbnb_guest_first_name,
            "airbnb_guest_last_name": self.airbnb_guest_last_name,
            "airbnb_checkin": self.airbnb_checkin.isoformat() if self.airbnb_checkin else None,
            "airbnb_checkout": self.airbnb_checkout.isoformat() if self.airbnb_checkout else None,
            "reservation_url": self.reservation_url,
            "airbnb_guestpic_url": self.airbnb_guestpic_url,
            "needs_manual_details": self.needs_manual_details,
            "phone_last4": self.phone_last4,
        }