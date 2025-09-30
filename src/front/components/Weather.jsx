import React, { useEffect, useState } from "react";

// Usage: <Weather latitude={lat} longitude={lng} />
export const Weather = ({ latitude, longitude }) => {
    const [weather, setWeather] = useState("Loading...");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!latitude || !longitude) {
            setWeather("No location");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        fetch(
            `https://probable-memory-q76jw5rqjpqrcxx5q-3001.app.github.dev/api/weather/current?latitude=${latitude}&longitude=${longitude}`
        )
            .then((response) => response.json())
            .then((data) => {
                if (data && data.weather) {
                    setWeather(data.weather);
                } else {
                    setWeather("N/A");
                }
            })
            .catch((err) => {
                setError("Failed to fetch weather");
                setWeather("N/A");
            })
            .finally(() => setLoading(false));
    }, [latitude, longitude]);

    return (
        <div
            style={{
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: "#e3e3e3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: 600,
                color: "#333",
                textAlign: "center", // optional, for multi-line
            }}
        >
            {loading ? "Loading..." : error ? error : weather}
        </div>
    );
};