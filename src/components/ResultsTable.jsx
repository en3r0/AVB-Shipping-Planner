import React, { useState, useRef, useEffect } from 'react';
import { Download, Database, ChevronDown } from 'lucide-react';

export default function ResultsTable({ results, zones, unit, categoryPricingEnabled, categories }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleExportCSV = () => {
        if (results.length === 0) return;

        let headers, rows;

        if (categoryPricingEnabled && categories.length > 0) {
            headers = ['Zip Code', 'Location', `Distance (${unit})`, 'Zone ID', ...categories.map(c => `${c} Price`)];
            rows = results.map(r => [
                `"${String(r.zipCode).padStart(5, '0')}"`,
                `"${r.locationLabel || ''}"`,
                `"${r.distance}"`,
                `"${r.zoneId}"`,
                ...categories.map(c => `"${r.categoryPrices?.[c] || ''}"`)
            ]);
        } else {
            headers = ['Zip Code', 'Location', 'Delivery Price', `Distance (${unit})`, 'Zone ID'];
            rows = results.map(r => [
                `"${String(r.zipCode).padStart(5, '0')}"`,
                `"${r.locationLabel || ''}"`,
                `"${r.price}"`,
                `"${r.distance}"`,
                `"${r.zoneId}"`
            ]);
        }

        const csvContent = [
            headers.map(h => `"${h}"`).join(','),
            ...rows.map(e => e.join(','))
        ].join('\n');

        // Client-side download — no backend needed
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'avb_shipping_planner.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsDropdownOpen(false);
    };

    const handleExportRules = () => {
        if (results.length === 0) return;

        let allZipCodes = results.map(r => String(r.zipCode).padStart(5, '0'));
        allZipCodes = [...new Set(allZipCodes)].join(',');

        const lines = [
            `"Rule Name","Price","Zip Codes"`,
            `"Member Name (AVBID) - No Shipping","","'${allZipCodes}"`
        ];

        const validZones = (zones || []).filter(z => z.radius !== '' && Number(z.radius) > 0);
        const sortedZones = [...validZones].sort((a, b) => Number(a.radius) - Number(b.radius));

        sortedZones.forEach((zone, index) => {
            const zoneId = index + 1;
            const zipsInZone = results
                .filter(r => r.zoneId === zoneId)
                .map(r => String(r.zipCode).padStart(5, '0'))
                .join(',');

            if (zipsInZone) {
                if (categoryPricingEnabled && categories.length > 0) {
                    categories.forEach(cat => {
                        const price = zone.categoryPrices?.[cat] || 0;
                        lines.push(`"Member Name (AVBID) - ${cat} - ${zone.radius || 0}mi","${price}","'${zipsInZone}"`);
                    });
                } else {
                    lines.push(`"Member Name (AVBID) - ${zone.radius || 0}mi","${zone.price || 0}","'${zipsInZone}"`);
                }
            }
        });

        const csvContent = lines.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'avb_shipping_rules.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsDropdownOpen(false);
    };

    if (results.length === 0) {
        return (
            <div className="glass-panel empty-state" style={{ marginTop: '24px' }}>
                <Database size={48} />
                <p>No zip codes found. Add a radius and valid center point.</p>
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ marginTop: '24px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Matching Zip Codes ({results.length})</h3>
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <button className="btn" onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                        <Download size={16} /> Export <ChevronDown size={14} style={{ marginLeft: '4px' }} />
                    </button>
                    {isDropdownOpen && (
                        <div className="glass-panel" style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            marginTop: '8px',
                            padding: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            minWidth: '160px',
                            zIndex: 50
                        }}>
                            <button className="btn btn-secondary" onClick={handleExportCSV} style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.9rem', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
                                Export CSV
                            </button>
                            <button className="btn btn-secondary" onClick={handleExportRules} style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.9rem', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
                                Export Rules
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="results-table-container">
                <table className="results-table">
                    <thead>
                        <tr>
                            <th>Zip Code</th>
                            <th>Location</th>
                            <th>Distance ({unit})</th>
                            {categoryPricingEnabled && categories.length > 0 ? (
                                categories.map(cat => (
                                    <th key={cat}>{cat}</th>
                                ))
                            ) : (
                                <th>Price</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {results.slice(0, 1000).map((item, i) => (
                            <tr key={`${item.zipCode}-${i}`}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div className="color-dot" style={{ background: item.color, width: '8px', height: '8px' }}></div>
                                        {item.zipCode}
                                    </div>
                                </td>
                                <td>{item.locationLabel}</td>
                                <td>{item.distance}</td>
                                {categoryPricingEnabled && categories.length > 0 ? (
                                    categories.map(cat => (
                                        <td key={cat}>${Number(item.categoryPrices?.[cat] || 0).toFixed(2)}</td>
                                    ))
                                ) : (
                                    <td>${Number(item.price || 0).toFixed(2)}</td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {results.length > 1000 && (
                <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Showing first 1000 of {results.length.toLocaleString()} results. Export to CSV to view all.
                </div>
            )}
        </div>
    );
}
