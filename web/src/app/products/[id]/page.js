'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/products/${id}`).then(data => { setProduct(data.product); setLoading(false); }).catch(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;
    if (!product) return <div className="empty-state" style={{ minHeight: '60vh' }}><h3>Product not found</h3></div>;

    return (
        <>
            <div className="container section">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px', alignItems: 'flex-start' }}>
                    {/* Image */}
                    <div style={{ flex: '1 1 min(100%, 400px)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--neutral-100)' }}>
                        {product.baseImage ? (
                            <img src={product.baseImage} alt={product.name} style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', aspectRatio: '4/5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', background: 'linear-gradient(135deg, var(--primary-100), var(--accent-100))' }}>🧵</div>
                        )}
                    </div>

                    {/* Details */}
                    <div style={{ flex: '1 1 min(100%, 400px)' }}>
                        <span className="badge badge-primary" style={{ marginBottom: '12px' }}>{product.category} • {product.subCategory}</span>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '12px' }}>{product.name}</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '24px' }}>{product.description}</p>

                        <div style={{ background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Price Range</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-700)' }}>₹{product.priceRange?.min} – ₹{product.priceRange?.max}</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>Final price depends on tailor, fabric, and customizations</div>
                        </div>

                        {/* Design Options */}
                        {product.designOptions && Object.keys(product.designOptions).some(k => product.designOptions[k]?.length > 0) && (
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>Available Design Options</h3>
                                {Object.entries(product.designOptions).map(([key, values]) => {
                                    if (!values || values.length === 0) return null;
                                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                                    return (
                                        <div key={key} style={{ marginBottom: '14px' }}>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: '6px' }}>{label}</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {values.map(v => <span key={v} className="badge badge-accent">{v}</span>)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <Link href={`/tailors?product=${product.type}`} className="btn btn-primary btn-lg btn-full" style={{ marginTop: '8px' }}>
                            Find a Tailor for This Product →
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
