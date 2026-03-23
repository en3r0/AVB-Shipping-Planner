import React, { useState, useEffect, useMemo } from 'react';
import { Sun, Moon } from 'lucide-react';
import MapDisplay from './components/MapDisplay';
import ControlPanel from './components/ControlPanel';
import ResultsTable from './components/ResultsTable';
import { calculateZipCodesForMultipleLocations } from './utils/geo';

const ZONE_COLORS = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
];

export default function App() {
    // App State
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '');
    const [unit, setUnit] = useState('mi'); // 'mi' or 'km'
    const [isDarkMode, setIsDarkMode] = useState(false); // Default to light mode
    
    // Multiple locations state
    const [locations, setLocations] = useState([
        { id: '1', label: '', lat: 36.1389318, lng: -115.2245634 }
    ]);

    // Resizer State
    const [sidebarWidth, setSidebarWidth] = useState(450);
    const [isDragging, setIsDragging] = useState(false);

    // Sidebar resize mouse event listeners
    useEffect(() => {
        if (!isDragging) return;
        
        const handleMouseMove = (e) => {
            // Container has 24px padding on left.
            let newWidth = e.clientX - 24;
            if (newWidth < 300) newWidth = 300; // min width
            if (newWidth > 800) newWidth = 800; // max width
            setSidebarWidth(newWidth);
            document.body.style.userSelect = 'none'; // prevent text selection while dragging
        };
        
        const handleMouseUp = () => {
            setIsDragging(false);
            document.body.style.userSelect = '';
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    // Apply theme class to document body
    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.remove('theme-light');
        } else {
            document.body.classList.add('theme-light');
        }
    }, [isDarkMode]);

    // Category pricing (optional feature)
    const [categoryPricingEnabled, setCategoryPricingEnabled] = useState(false);
    const [categories, setCategories] = useState([]);

    // Zones format: { id, radius, price, color, categoryPrices: { [categoryName]: price } }
    const [zones, setZones] = useState([
        { id: '1', radius: '5', price: '5.00', color: ZONE_COLORS[0], categoryPrices: {} }
    ]);

    // Derived zip codes calculation — uses all locations, deduplicates automatically
    const calculatedZipCodes = useMemo(() => {
        return calculateZipCodesForMultipleLocations(locations, zones, unit, categoryPricingEnabled, categories);
    }, [locations, zones, unit, categoryPricingEnabled, categories]);

    const handleGeocode = async (locationId, searchAddress) => {
        if (!searchAddress.trim() || !apiKey) return;
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchAddress)}&key=${apiKey}`);
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry.location;
                setLocations(prev => prev.map(loc =>
                    loc.id === locationId ? { ...loc, lat, lng, label: searchAddress } : loc
                ));
            } else {
                alert('Address not found. Please try again.');
            }
        } catch (e) {
            console.error('Geocoding error:', e);
            alert('Error fetching address coordinates.');
        }
    };

    const addLocation = () => {
        const newId = Date.now().toString();
        setLocations(prev => [...prev, { id: newId, label: '', lat: null, lng: null }]);
    };

    const removeLocation = (id) => {
        if (locations.length <= 1) return;
        setLocations(prev => prev.filter(loc => loc.id !== id));
    };

    const addZone = () => {
        if (zones.length >= 5) return;
        const newId = Date.now().toString();
        const color = ZONE_COLORS[zones.length];
        setZones([...zones, { id: newId, radius: '', price: '', color, categoryPrices: {} }]);
    };

    const removeZone = (id) => {
        const newZones = zones.filter(z => z.id !== id);
        const updatedZones = newZones.map((z, idx) => ({ ...z, color: ZONE_COLORS[idx] }));
        setZones(updatedZones);
    };

    const updateZone = (id, field, value) => {
        setZones(zones.map(z => z.id === id ? { ...z, [field]: value } : z));
    };

    const updateZoneCategoryPrice = (zoneId, categoryName, price) => {
        setZones(zones.map(z => {
            if (z.id === zoneId) {
                return { ...z, categoryPrices: { ...z.categoryPrices, [categoryName]: price } };
            }
            return z;
        }));
    };

    // Category management
    const addCategory = (name) => {
        if (!name.trim() || categories.includes(name.trim())) return;
        setCategories([...categories, name.trim()]);
    };

    const removeCategory = (name) => {
        setCategories(categories.filter(c => c !== name));
        // Also clean up categoryPrices in all zones
        setZones(zones.map(z => {
            const newPrices = { ...z.categoryPrices };
            delete newPrices[name];
            return { ...z, categoryPrices: newPrices };
        }));
    };

    // Center map on first location with valid coordinates
    const mapCenter = useMemo(() => {
        const validLoc = locations.find(loc => loc.lat != null && loc.lng != null);
        return validLoc ? { lat: validLoc.lat, lng: validLoc.lng } : { lat: 36.1389318, lng: -115.2245634 };
    }, [locations]);

    return (
        <div 
            className={`app-container ${isDarkMode ? 'theme-dark' : 'theme-light'} ${isDragging ? 'is-dragging' : ''}`}
            style={{ 
                gridTemplateColumns: `${sidebarWidth}px 12px 1fr`,
                gap: '12px'
            }}
        >
            {/* LEFT SIDEBAR CONTROLS */}
            <div className="sidebar">
                <ControlPanel
                    locations={locations}
                    addLocation={addLocation}
                    removeLocation={removeLocation}
                    handleGeocode={handleGeocode}
                    unit={unit}
                    setUnit={setUnit}
                    zones={zones}
                    addZone={addZone}
                    removeZone={removeZone}
                    updateZone={updateZone}
                    categoryPricingEnabled={categoryPricingEnabled}
                    setCategoryPricingEnabled={setCategoryPricingEnabled}
                    categories={categories}
                    addCategory={addCategory}
                    removeCategory={removeCategory}
                    updateZoneCategoryPrice={updateZoneCategoryPrice}
                    isDarkMode={isDarkMode}
                    setIsDarkMode={setIsDarkMode}
                />

                <ResultsTable
                    results={calculatedZipCodes}
                    zones={zones}
                    unit={unit}
                    categoryPricingEnabled={categoryPricingEnabled}
                    categories={categories}
                />

                {/* Spacer to push toggle to bottom if content is short */}
                <div style={{ flexGrow: 1, minHeight: '32px' }}></div>

                {/* Dark Mode Toggle */}
                <div className="glass-panel" style={{ 
                    marginTop: 'auto', 
                    padding: '20px 24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between'
                }}>
                    <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsDarkMode(!isDarkMode)}>
                        {isDarkMode ? <Moon size={16} /> : <Sun size={16} />} 
                        <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                    </label>
                    <button
                        className={`toggle-switch ${isDarkMode ? 'active' : ''}`}
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        style={{ backgroundColor: isDarkMode ? 'var(--accent)' : 'var(--glass-border)' }}
                    >
                        <div className="toggle-thumb" style={{ transform: isDarkMode ? 'translateX(20px)' : 'translateX(0)' }} />
                    </button>
                </div>
            </div>

            {/* RESIZER */}
            <div 
                className="sidebar-resizer" 
                onMouseDown={() => setIsDragging(true)}
            >
                <div className="resizer-handle"></div>
            </div>

            {/* RIGHT MAP AREA */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <MapDisplay
                    center={mapCenter}
                    locations={locations}
                    zones={zones}
                    unit={unit}
                    isDarkMode={isDarkMode}
                    apiKey={apiKey}
                />
            </div>
        </div>
    );
}
