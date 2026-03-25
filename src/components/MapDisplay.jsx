import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    minHeight: '400px',
    borderRadius: '16px'
};

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    styles: [
        {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#ffffff" }]
        },
        {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#000000" }, { lightness: 13 }]
        },
        {
            featureType: "administrative",
            elementType: "geometry.fill",
            stylers: [{ color: "#000000" }]
        },
        {
            featureType: "administrative",
            elementType: "geometry.stroke",
            stylers: [{ color: "#144b53" }, { lightness: 14 }, { weight: 1.4 }]
        },
        {
            featureType: "landscape",
            elementType: "all",
            stylers: [{ color: "#08304b" }]
        },
        {
            featureType: "poi",
            elementType: "geometry",
            stylers: [{ color: "#0c4152" }, { lightness: 5 }]
        },
        {
            featureType: "road.highway",
            elementType: "geometry.fill",
            stylers: [{ color: "#000000" }]
        },
        {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#0b434f" }, { lightness: 25 }]
        },
        {
            featureType: "road.arterial",
            elementType: "geometry.fill",
            stylers: [{ color: "#000000" }]
        },
        {
            featureType: "road.arterial",
            elementType: "geometry.stroke",
            stylers: [{ color: "#0b3d51" }, { lightness: 16 }]
        },
        {
            featureType: "road.local",
            elementType: "geometry",
            stylers: [{ color: "#000000" }]
        },
        {
            featureType: "transit",
            elementType: "all",
            stylers: [{ color: "#146474" }]
        },
        {
            featureType: "water",
            elementType: "all",
            stylers: [{ color: "#021019" }]
        }
    ]
};

// Custom component to manage the native google.maps.Circle manually 
// to avoid ghosting bugs in the @react-google-maps/api Circle component
function ZoneCircle({ map, center, radius, color, unit }) {
    const [circle, setCircle] = useState(null);

    const getRadiusInMeters = (radiusStr, unitStr) => {
        const val = Number(radiusStr);
        if (isNaN(val)) return 0;
        return unitStr === 'mi' ? val * 1609.34 : val * 1000;
    };

    useEffect(() => {
        if (!map || !window.google) return;

        const newCircle = new window.google.maps.Circle({
            map,
            center,
            radius: getRadiusInMeters(radius, unit),
            strokeColor: color,
            strokeOpacity: 0.9,
            strokeWeight: 3,
            fillColor: color,
            fillOpacity: 0.08,
            clickable: false
        });
        
        setCircle(newCircle);

        return () => {
            newCircle.setMap(null);
        };
    }, [map]); // Only run once when map loads

    // Update properties reactively without re-mounting
    useEffect(() => {
        if (circle) {
            circle.setRadius(getRadiusInMeters(radius, unit));
            circle.setCenter(center);
            circle.setOptions({ strokeColor: color, fillColor: color });
        }
    }, [circle, radius, center, color, unit]);

    return null;
}

// Marker component for each location
function LocationMarker({ map, position, label }) {
    const [marker, setMarker] = useState(null);

    useEffect(() => {
        if (!map || !window.google || !position.lat || !position.lng) return;

        const newMarker = new window.google.maps.Marker({
            map,
            position,
            label: {
                text: label,
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '13px'
            },
            icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 14,
                fillColor: '#6366f1',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
            }
        });

        setMarker(newMarker);

        return () => {
            newMarker.setMap(null);
        };
    }, [map]);

    // Update reactively
    useEffect(() => {
        if (marker && position.lat && position.lng) {
            marker.setPosition(position);
            marker.setLabel({
                text: label,
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '13px'
            });
        }
    }, [marker, position, label]);

    return null;
}

export default function MapDisplay({ center, locations, zones, unit, apiKey, isDarkMode }) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey || ''
    });

    const [mapInstance, setMapInstance] = useState(null);

    if (loadError) {
        return (
            <div className="glass-panel map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
                <p style={{ color: '#ef4444' }}>Error loading Google Maps</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="glass-panel map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
                <p>Loading Map...</p>
            </div>
        );
    }

    // Get valid locations (those with coordinates)
    const validLocations = (locations || []).filter(loc => loc.lat != null && loc.lng != null);

    // Auto-fit bounds logic
    useEffect(() => {
        if (!mapInstance || !window.google || validLocations.length === 0) return;

        if (validLocations.length === 1) {
            mapInstance.setCenter({ lat: validLocations[0].lat, lng: validLocations[0].lng });
        } else {
            const bounds = new window.google.maps.LatLngBounds();
            validLocations.forEach(loc => {
                bounds.extend(new window.google.maps.LatLng(loc.lat, loc.lng));
            });
            mapInstance.fitBounds(bounds);
        }
    }, [mapInstance, locations]);

    return (
        <div className="glass-panel map-container" style={{ height: '100%', minHeight: '400px', width: '100%' }}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={10}
                options={{ ...mapOptions, styles: isDarkMode ? mapOptions.styles : [] }}
                onLoad={map => setMapInstance(map)}
                onUnmount={() => setMapInstance(null)}
            >
                {/* Render circles for EACH location × zone */}
                {mapInstance && validLocations.map((loc, locIndex) =>
                    [...zones]
                        .filter(zone => zone.radius && Number(zone.radius) > 0)
                        .sort((a, b) => Number(b.radius) - Number(a.radius))
                        .map(zone => (
                            <ZoneCircle
                                key={`${loc.id}-${zone.id}`}
                                map={mapInstance}
                                center={{ lat: loc.lat, lng: loc.lng }}
                                radius={zone.radius}
                                color={zone.color}
                                unit={unit}
                            />
                        ))
                )}

                {/* Render a marker for each location */}
                {mapInstance && validLocations.map((loc, index) => (
                    <LocationMarker
                        key={`marker-${loc.id}`}
                        map={mapInstance}
                        position={{ lat: loc.lat, lng: loc.lng }}
                        label={String(index + 1)}
                    />
                ))}
            </GoogleMap>
        </div>
    );
}
