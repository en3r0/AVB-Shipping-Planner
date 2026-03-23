import React, { useState } from 'react';
import { Plus, Trash2, MapPin, Search, Tag, X, Sun, Moon } from 'lucide-react';

export default function ControlPanel({
    locations,
    addLocation,
    removeLocation,
    handleGeocode,
    unit,
    setUnit,
    zones,
    addZone,
    updateZone,
    removeZone,
    categoryPricingEnabled,
    setCategoryPricingEnabled,
    categories,
    addCategory,
    removeCategory,
    updateZoneCategoryPrice
}) {
    const [addressInputs, setAddressInputs] = useState({});
    const [newCategoryName, setNewCategoryName] = useState('');

    const getAddressValue = (locationId) => addressInputs[locationId] || '';
    const setAddressValue = (locationId, value) => {
        setAddressInputs(prev => ({ ...prev, [locationId]: value }));
    };

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            addCategory(newCategoryName.trim());
            setNewCategoryName('');
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={24} color="var(--accent)" />
                Delivery Restrictions
            </h2>

            {/* Locations */}
            <div className="input-group">
                <label>Store Locations</label>
                <div className="locations-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {locations.map((loc, index) => (
                        <div key={loc.id} className="location-entry animate-slide-down" style={{
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                            padding: '10px 12px',
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '10px',
                            transition: 'border-color 0.2s ease'
                        }}>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: 'var(--accent)',
                                minWidth: '18px',
                                textAlign: 'center',
                                lineHeight: 1
                            }}>{index + 1}</span>
                            <input
                                type="text"
                                value={getAddressValue(loc.id)}
                                onChange={(e) => setAddressValue(loc.id, e.target.value)}
                                placeholder={index === 0 ? "E.g., 123 Main St, New York, NY 10001" : "Enter another address..."}
                                style={{ flex: 1, margin: 0 }}
                                onKeyDown={(e) => e.key === 'Enter' && handleGeocode(loc.id, getAddressValue(loc.id))}
                            />
                            <button className="btn" onClick={() => handleGeocode(loc.id, getAddressValue(loc.id))} style={{ padding: '6px 10px' }}>
                                <Search size={16} />
                            </button>
                            {locations.length > 1 && (
                                <button className="remove-btn" onClick={() => removeLocation(loc.id)} style={{ padding: '4px' }}>
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button
                    className="btn btn-secondary"
                    style={{ width: '100%', marginTop: '10px', fontSize: '0.9rem', padding: '10px' }}
                    onClick={addLocation}
                >
                    <Plus size={16} /> Add Location
                </button>
            </div>

            <div className="input-group">
                <label>Measurement Unit</label>
                <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                    <option value="mi">Miles (mi)</option>
                    <option value="km">Kilometers (km)</option>
                </select>
            </div>

            {/* Category Pricing Toggle */}
            <div className="toggle-section" style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Tag size={18} color="var(--text-muted)" />
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>
                            Category Pricing
                        </label>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={categoryPricingEnabled}
                            onChange={(e) => setCategoryPricingEnabled(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                {categoryPricingEnabled && (
                    <div className="category-section animate-slide-down" style={{ marginTop: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Category name (e.g., Furniture)"
                                style={{ flex: 1, padding: '8px 12px', fontSize: '0.9rem' }}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                            />
                            <button
                                className="btn"
                                onClick={handleAddCategory}
                                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        <div className="category-tags">
                            {categories.map(cat => (
                                <span key={cat} className="category-tag">
                                    {cat}
                                    <button onClick={() => removeCategory(cat)} className="category-tag-remove">
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                            {categories.length === 0 && (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                    Add product categories above
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '32px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Delivery Zones</h3>
                <span className="badge" style={{ background: zones.length >= 5 ? '#ef4444' : 'var(--accent)' }}>
                    {zones.length} / 5
                </span>
            </div>

            <div className="zones-container">
                {zones.map((zone, index) => (
                    <div key={zone.id} className="zone-card animate-slide-down" style={{ '--zone-color': zone.color }}>
                        <div className="zone-header">
                            <div className="zone-title">
                                <div className="color-dot" style={{ '--zone-color': zone.color }}></div>
                                Zone {index + 1}
                            </div>
                            <button className="remove-btn" onClick={() => removeZone(zone.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="zone-inputs">
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label>Set Radius ({unit})</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={zone.radius}
                                    onChange={(e) => updateZone(zone.id, 'radius', e.target.value)}
                                    placeholder={`E.g., 10`}
                                />
                            </div>

                            {/* Show single price when categories are OFF */}
                            {!categoryPricingEnabled && (
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Set Price for this Radius ($)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={zone.price}
                                        onChange={(e) => updateZone(zone.id, 'price', e.target.value)}
                                        placeholder="E.g., 5.00"
                                    />
                                </div>
                            )}

                            {/* Show per-category prices when categories are ON */}
                            {categoryPricingEnabled && categories.length > 0 && (
                                <div className="category-prices-section">
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>
                                        Prices by Category
                                    </label>
                                    {categories.map(cat => (
                                        <div key={cat} className="category-price-row">
                                            <span className="category-price-label">{cat}</span>
                                            <div style={{ position: 'relative', flex: 1 }}>
                                                <span style={{
                                                    position: 'absolute', left: '10px', top: '50%',
                                                    transform: 'translateY(-50%)', color: 'var(--text-muted)',
                                                    fontSize: '0.9rem', pointerEvents: 'none'
                                                }}>$</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={zone.categoryPrices?.[cat] || ''}
                                                    onChange={(e) => updateZoneCategoryPrice(zone.id, cat, e.target.value)}
                                                    placeholder="0.00"
                                                    style={{ paddingLeft: '24px', width: '100%' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Show default price as fallback when categories ON but none added */}
                            {categoryPricingEnabled && categories.length === 0 && (
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Default Price ($)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={zone.price}
                                        onChange={(e) => updateZone(zone.id, 'price', e.target.value)}
                                        placeholder="E.g., 5.00"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {zones.length < 5 && (
                <button
                    className="btn btn-secondary"
                    style={{ width: '100%', marginTop: '16px' }}
                    onClick={addZone}
                >
                    <Plus size={18} /> Add Delivery Zone
                </button>
            )}
        </div>
    );
}
