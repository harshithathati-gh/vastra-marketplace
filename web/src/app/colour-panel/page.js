'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ColourPanelPage() {
    const [combinations, setCombinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPattern, setSelectedPattern] = useState(null);

    useEffect(() => {
        const fetchColors = async () => {
            try {
                const res = await api.get('/colors');
                const data = res.data || [];
                setCombinations(data);
                if (data.length > 0) setSelectedPattern(data[0]);
            } catch (err) {
                console.error('Failed to fetch colors', err);
            } finally {
                setLoading(false);
            }
        };
        fetchColors();
    }, []);

    if (loading) return <div className="container section text-center">Loading Colour Panel...</div>;

    if (!combinations || combinations.length === 0) {
        return <div className="container section text-center">No colour combinations found yet! Check back later.</div>;
    }

    return (
        <div className="container section" style={{ minHeight: '80vh' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Tailoring Colour Combinations</h1>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '40px' }}>Mix and match the perfect palette for your bespoke outfits.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 3fr', gap: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--neutral-200)', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Palettes</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {combinations.map(combo => (
                            <div
                                key={combo._id}
                                onClick={() => setSelectedPattern(combo)}
                                style={{
                                    padding: '15px',
                                    cursor: 'pointer',
                                    border: selectedPattern?._id === combo._id ? '2px solid var(--primary)' : '1px solid var(--neutral-200)',
                                    borderRadius: 'var(--radius-md)',
                                    background: selectedPattern?._id === combo._id ? 'var(--primary-light)' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: combo.baseColor?.hex || '#ccc', border: '1px solid #ddd' }}></div>
                                <span style={{ fontWeight: 600 }}>{combo.baseColor?.name || 'Unknown'} Base</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ padding: '30px', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {selectedPattern ? (
                        <>
                            <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>{selectedPattern.baseColor.name} & Friends</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', textAlign: 'center' }}>{selectedPattern.description}</p>

                            <div style={{ display: 'flex', gap: '0', borderRadius: 'var(--radius-lg)', overflow: 'hidden', width: '100%', maxWidth: '600px', height: '150px', boxShadow: 'var(--shadow-lg)' }}>
                                <div style={{ flex: 2, background: selectedPattern.baseColor.hex, display: 'flex', alignItems: 'flex-end', padding: '15px' }}>
                                    <span style={{ background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', color: '#333' }}>BASE: {selectedPattern.baseColor.name}</span>
                                </div>
                                {selectedPattern.complementaryColors?.map((c, idx) => (
                                    <div key={idx} style={{ flex: 1, background: c.hex, display: 'flex', alignItems: 'flex-end', padding: '15px' }}>
                                        <span style={{ background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', color: '#333' }}>{c.name}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '40px', width: '100%' }}>
                                <h4 style={{ marginBottom: '15px', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '10px' }}>Recommended Styles for this Palette</h4>
                                <ul style={{ columnCount: 2, gap: '20px' }}>
                                    {selectedPattern.complementaryColors?.map((c, i) => (
                                        <li key={i} style={{ marginBottom: '10px' }}>
                                            <strong>{c.styleType.charAt(0).toUpperCase() + c.styleType.slice(1)}:</strong> Focus on adding {c.name} ({c.hex}) elements against the primary {selectedPattern.baseColor.name} base.
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    ) : (
                        <p>Select a palette to view matching colors.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
