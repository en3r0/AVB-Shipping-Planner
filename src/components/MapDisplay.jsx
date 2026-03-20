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

export default function MapDisplay({ center, zones, unit, apiKey, isDarkMode }) {
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
                {/* Render custom manual circles to avoid library ghosting bugs */}
                {mapInstance && [...zones]
                    .filter(zone => zone.radius && Number(zone.radius) > 0)
                    .sort((a, b) => Number(b.radius) - Number(a.radius))
                    .map(zone => (
                        <ZoneCircle
                            key={zone.id}
                            map={mapInstance}
                            center={center}
                            radius={zone.radius}
                            color={zone.color}
                            unit={unit}
                        />
                    ))}
            </GoogleMap>
        </div>
    );
}
