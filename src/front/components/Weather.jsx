import React, { useEffect, useState } from "react";
import overcast from "../assets/img/Weather/3313977.webp";
import clearNight from "../assets/img/Weather/Weather-PNG-Image.webp";
import partlyCloudy from "../assets/img/Weather/light-clouds-png-xvy41-e02fueyukr1d1omb.webp";
import cloudyNight from "../assets/img/Weather/overcast-sky-png-pab-xeg8zlfcfi0kgfod.webp";
import snow from "../assets/img/Weather/png-intricate-white-snowflake-white_53876-620830.webp";
import rain from "../assets/img/Weather/Rain-Cloud-PNG-Photo.webp";
import sunny from "../assets/img/Weather/Summer-Sun-PNG-Photo.webp";
import defaultImg from "../assets/img/Weather/d7t4mdm-a38e3582-7d57-417a-841f-28fd430ef47f.webp";

// Map WeatherAPI code and is_day to your custom images
const getWeatherImage = (code, isDay) => {
    if (code === 1000) return isDay ? sunny : clearNight;
    if ([1003, 1006].includes(code)) return isDay ? partlyCloudy : cloudyNight;
    if (code === 1009) return overcast;
    if ([1063, 1180, 1183, 1186, 1189].includes(code)) return rain;
    if ([1114, 1210, 1213].includes(code)) return snow;
    return defaultImg;
};

export const Weather = ({ latitude, longitude }) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Weather.jsx: latitude, longitude", latitude, longitude);
        if (!latitude || !longitude) {
            setWeather(null);
            setLoading(false);
            setError("No location");
            return;
        }
        setLoading(true);
        setError(null);
        fetch(
            `https://probable-memory-q76jw5rqjpqrcxx5q-3001.app.github.dev/api/weather/current?latitude=${latitude}&longitude=${longitude}`
        )
            .then((res) => res.json())
            .then((data) => {
                console.log("Weather.jsx: API response", data);
                if (data && data.weather && data.code !== undefined && data.is_day !== undefined) {
                    setWeather(data);
                    setError(null);
                } else {
                    setWeather(null);
                    setError("N/A");
                }
                setLoading(false);
            })
            .catch((err) => {
                setWeather(null);
                setError("API error");
                setLoading(false);
                console.error("Weather.jsx: fetch error", err);
            });
    }, [latitude, longitude]);

    let content;
    if (loading) {
        content = "Loading...";
    } else if (error) {
        content = error;
    } else if (weather) {
        const imgSrc = getWeatherImage(weather.code, weather.is_day);
        // Extract the temperature (before the comma) and parse as number
        const temp = weather.weather.split(",")[0].replace(/[^\d.-]/g, "");
        const desc = weather.weather.split(",").slice(1).join(",").trim();
        content = (
            <>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#333", marginBottom: 4 }}>
                    {temp ? `${temp}°F` : "--"}
                </div>
                <img
                    src={imgSrc}
                    alt="weather"
                    style={{ width: 100, height: 100, marginBottom: 8 }}
                />
                <div style={{ fontSize: 18, fontWeight: 500, color: "#333" }}>{desc}</div>
            </>
        );
    } else {
        content = "N/A";
    }

    return (
        <div
            style={{
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: "#e3e3e3",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
            }}
        >
            {content}
        </div>
    );
};