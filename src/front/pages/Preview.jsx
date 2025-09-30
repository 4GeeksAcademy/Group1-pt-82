import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NearbyRestaurants } from "../components/NearbyRestaurants";
import { Weather } from "../components/Weather";
import { useGeoLocation } from "../hooks/GeoLocation";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Preview = () => {
    const location = useLocation();
    const geoLoc = useGeoLocation();
    const navigate = useNavigate();
    const guestName = location.state?.guestName || "Guest";
    const image = location.state?.image || "https://picsum.photos/seed/guest/600/400";
    const { store } = useGlobalReducer();
    const token = store?.session?.token;

    const customMessage = "We hope you enjoy your stay! Let us know if you need anything.";

    return (
        <div className="container py-4" style={{ minHeight: "100vh" }}>
            <div className="row mb-4 align-items-center justify-content-center">
                {/* Weather */}
                <div className="col-12 col-md-4 d-flex justify-content-center mb-3 mb-md-0">
                    <div
                    >
                        <Weather latitude={geoLoc.latitude} longitude={geoLoc.longitude} />
                    </div>
                </div>
                {/* Profile Picture */}
                <div className="col-12 col-md-4 d-flex flex-column align-items-center">
                    <div
                        style={{
                            width: 140,
                            height: 140,
                            borderRadius: "50%",
                            overflow: "hidden",
                            border: "4px solid #007bff",
                            marginBottom: 16,
                        }}
                    >
                        <img
                            src={image}
                            alt="Guest"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    </div>
                    <div
                        className="px-3 py-2 bg-white rounded shadow-sm mb-2"
                        style={{ fontSize: 22, fontWeight: 500 }}
                    >
                        Welcome {guestName}
                    </div>
                </div>
                {/* Customized Message */}
                <div className="col-12 col-md-4 d-flex  justify-content-center" style={{ width: '25%' }}>
                    <div>
                        <textarea placeholder="Enter your message" style={{ width: 400, height: 100, fontSize: 30, border: 'none', fontWeight: 'bold' }} />
                    </div>
                </div>
            </div>
            {/* Nearby Restaurants */}
            <div className="row mt-4">
                <div className="col-12">
                    <NearbyRestaurants />
                </div>
            </div>
            <div className="mt-4 text-center">
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    Back
                </button>
            </div>
        </div>
    );
};