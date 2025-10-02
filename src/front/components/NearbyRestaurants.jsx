import React, { useState, useEffect } from 'react';
import { useGeoLocation } from '../hooks/GeoLocation';

export const NearbyRestaurants = () => {
    const location = useGeoLocation(); // Your hook returns { latitude, longitude, error }
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    useEffect(() => {
        // Only fetch when we have valid coordinates
        if (location.latitude && location.longitude && !location.error) {
            fetchNearbyRestaurants();
        }
    }, [location.latitude, location.longitude]);

    const fetchNearbyRestaurants = async () => {
        setLoading(true);
        setApiError(null);

        try {
            const response = await fetch(
                `https://probable-memory-q76jw5rqjpqrcxx5q-3001.app.github.dev/api/restaurants/nearby?latitude=${location.latitude}&longitude=${location.longitude}&radius=5000`
            );

            if (response.ok) {
                const data = await response.json();
                setRestaurants(data.businesses || []);
            } else {
                setApiError('Failed to fetch restaurants');
            }
        } catch (err) {
            setApiError('Error fetching restaurants: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Show loading while getting location
    if (!location.latitude && !location.error) {
        return (
            <div className="text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Getting your location...</span>
                </div>
                <p>Getting your location...</p>
            </div>
        );
    }

    // Show geolocation error
    if (location.error) {
        return (
            <div className="alert alert-warning">
                Location Error: {location.error}
            </div>
        );
    }

    return (
        <div className="container" style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8, maxWidth: '50%', marginLeft: 0, marginRight: 'auto', textAlign: 'left' }}>
            <h4 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Nearby Restaurants</h4>
            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: 12 }}>
                Showing restaurants near: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </p>

            {loading && (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading restaurants...</span>
                    </div>
                </div>
            )}

            {apiError && (
                <div className="alert alert-danger">
                    {apiError}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {restaurants.map((restaurant) => (
                    <div key={restaurant.id} style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', borderRadius: 8, padding: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                        {/* Restaurant icon/image */}
                        <div style={{ flex: '0 0 48px', width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', background: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                            {restaurant.image_url ? (
                                <img
                                    src={restaurant.image_url}
                                    alt={restaurant.name}
                                    style={{ width: 48, height: 48, objectFit: 'cover' }}
                                />
                            ) : (
                                <span role="img" aria-label="restaurant" style={{ fontSize: 24, color: '#adb5bd' }}>🍽️</span>
                            )}
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 500, fontSize: '1rem', lineHeight: 1.2 }}>{restaurant.name}</div>
                            <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: 2 }}>
                                {restaurant.categories?.map(cat => cat.title).join(', ')}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#495057' }}>
                                <span style={{ marginRight: 8 }}>⭐ {restaurant.rating}</span>
                                <span style={{ marginRight: 8 }}>{(restaurant.distance / 1000).toFixed(1)} km</span>
                                <span>{restaurant.location?.display_address?.join(', ')}</span>
                            </div>
                        </div>
                        {/* Call button */}
                        {restaurant.phone && (
                            <a href={`tel:${restaurant.phone}`} className="btn btn-outline-primary btn-sm" style={{ marginLeft: 8, whiteSpace: 'nowrap' }}>
                                Call
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};