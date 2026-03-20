import React from 'react';
import { Download, Database } from 'lucide-react';

export default function ResultsTable({ results, unit, categoryPricingEnabled, categories }) {
    const handleExport = async () => {
        if (results.length === 0) return;

        let headers, rows;

        if (categoryPricingEnabled && categories.length > 0) {
            headers = ['Zip Code', `Distance (${unit})`, 'Zone ID', ...categories.map(c => `${c} Price`)];
            rows = results.map(r => [
                `"${String(r.zipCode).padStart(5, '0')}"`,
                `"${r.distance}"`,
                `"${r.zoneId}"`,
                ...categories.map(c => `"${r.categoryPrices?.[c] || ''}"`)
            ]);
        } else {
            headers = ['Zip Code', 'Delivery Price', `Distance (${unit})`, 'Zone ID'];
            rows = results.map(r => [
                `"${String(r.zipCode).padStart(5, '0')}"`,
                `"${r.price}"`,
                `"${r.distance}"`,
                `"${r.zoneId}"`
            ]);
        }

        const csvContent = [
            headers.map(h => `"${h}"`).join(','),
            ...rows.map(e => e.join(','))
        ].join('\n');

        // POST to our server endpoint which responds with proper
        // Content-Disposition: attachment headers.
        try {
            const response = await fetch('/api/download-csv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    csvContent,
                    filename: 'avb_shipping_planner.csv'
                })
            });

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'avb_shipping_planner.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        }
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
                <button className="btn" onClick={handleExport} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                    <Download size={16} /> Export CSV
                </button>
            </div>

            <div className="results-table-container">
                <table className="results-table">
                    <thead>
                        <tr>
                            <th>Zip Code</th>
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
                        {results.map((item, i) => (
                            <tr key={`${item.zipCode}-${i}`}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div className="color-dot" style={{ background: item.color, width: '8px', height: '8px' }}></div>
                                        {item.zipCode}
                                    </div>
                                </td>
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
        </div>
    );
}
