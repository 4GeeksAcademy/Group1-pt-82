import { useLocation, useNavigate } from "react-router-dom";
import { NearbyRestaurants } from "../components/NearbyRestaurants";
import { Weather } from "../components/Weather";
import { useGeoLocation } from "../hooks/GeoLocation";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "./Preview.css";

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
        <div className="container py-4" style={{ minHeight: "100vh", position: "relative" }}>
            <div className="row mb-4 align-items-center justify-content-center">
                {/* Weather */}
                <div className="col-12 col-md-4 d-flex justify-content-center mb-3 mb-md-0">
                    <div>
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
                    <div className="px-3 py-2 bg-white rounded shadow-sm mb-2" style={{ fontSize: 22, fontWeight: 500 }}>
                        Welcome {guestName}
                    </div>
                </div>

                {/* Customized Message */}
                <div className="col-12 col-md-4 d-flex justify-content-center" style={{ width: "25%" }}>
                    <div>
                        <textarea
                            placeholder="Enter your message"
                            style={{
                                width: 400,
                                height: 100,
                                fontSize: 30,
                                border: "none",
                                fontWeight: "bold",
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Nearby Restaurants and QR Code side by side */}
            <div className="row mt-4">
                {/* Restaurants */}
                <div className="col-12 col-lg-8">
                    <NearbyRestaurants />
                </div>
                {/* QR Code */}
                <div className="col-12 col-lg-4 d-flex align-items-stretch">
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: "100%", // ensures full height
                        }}
                    >
                        <div
                            style={{
                                background: "#fff",
                                borderRadius: 12,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 24,
                            }}
                        >
                            {/* Dummy QR SVG */}
                            <svg viewBox="0 0 300 300" width="100%" height="100%" style={{ maxWidth: 300, maxHeight: 300 }}>
                                <rect x="0" y="0" width="300" height="300" fill="#fff" />
                                {/* Finder patterns */}
                                <rect x="20" y="20" width="60" height="60" fill="#000" />
                                <rect x="30" y="30" width="40" height="40" fill="#fff" />
                                <rect x="40" y="40" width="20" height="20" fill="#000" />

                                <rect x="220" y="20" width="60" height="60" fill="#000" />
                                <rect x="230" y="30" width="40" height="40" fill="#fff" />
                                <rect x="240" y="40" width="20" height="20" fill="#000" />

                                <rect x="20" y="220" width="60" height="60" fill="#000" />
                                <rect x="30" y="230" width="40" height="40" fill="#fff" />
                                <rect x="40" y="240" width="20" height="20" fill="#000" />

                                {/* Random modules */}
                                <g fill="#000">
                                    <rect x="120" y="20" width="12" height="12" />
                                    <rect x="150" y="20" width="12" height="12" />
                                    <rect x="180" y="20" width="12" height="12" />
                                    <rect x="120" y="60" width="12" height="12" />
                                    <rect x="180" y="60" width="12" height="12" />
                                    <rect x="120" y="120" width="12" height="12" />
                                    <rect x="150" y="120" width="12" height="12" />
                                    <rect x="180" y="120" width="12" height="12" />
                                    <rect x="60" y="150" width="12" height="12" />
                                    <rect x="90" y="180" width="12" height="12" />
                                    <rect x="120" y="180" width="12" height="12" />
                                    <rect x="150" y="210" width="12" height="12" />
                                    <rect x="180" y="240" width="12" height="12" />
                                    <rect x="210" y="270" width="12" height="12" />
                                    <rect x="240" y="180" width="12" height="12" />
                                    <rect x="270" y="210" width="12" height="12" />
                                </g>
                            </svg>
                            <div style={{ fontSize: 18, marginTop: 12, color: "#888" }}>Scan for WiFi (dummy QR)</div>
                        </div>
                    </div>
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
