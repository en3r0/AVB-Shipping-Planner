import React, { useState, useEffect, useMemo } from 'react';
import { Sun, Moon } from 'lucide-react';
import MapDisplay from './components/MapDisplay';
import ControlPanel from './components/ControlPanel';
import ResultsTable from './components/ResultsTable';
import { calculateZipCodesForZones } from './utils/geo';

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
    const [center, setCenter] = useState({ lat: 36.1389318, lng: -115.2245634 }); // Default: 2780 S Jones Blvd, Las Vegas NV 89146
    const [unit, setUnit] = useState('mi'); // 'mi' or 'km'
    const [isDarkMode, setIsDarkMode] = useState(false); // Default to light mode
    
    // Resizer State
    const [sidebarWidth, setSidebarWidth] = useState(380);
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

    // Derived zip codes calculation
    const calculatedZipCodes = useMemo(() => {
        return calculateZipCodesForZones(center.lat, center.lng, zones, unit, categoryPricingEnabled, categories);
    }, [center, zones, unit, categoryPricingEnabled, categories]);

    const handleGeocode = async (searchAddress) => {
        if (!searchAddress.trim() || !apiKey) return;
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchAddress)}&key=${apiKey}`);
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                setCenter(data.results[0].geometry.location);
            } else {
                alert('Address not found. Please try again.');
            }
        } catch (e) {
            console.error('Geocoding error:', e);
            alert('Error fetching address coordinates.');
        }
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
                    center={center}
                    zones={zones}
                    unit={unit}
                    isDarkMode={isDarkMode}
                    apiKey={apiKey}
                />
            </div>
        </div>
    );
}
