'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const SPEC_LABELS = {
    men_ethnic: "Men's Ethnic", men_western: "Men's Western", women_ethnic: "Women's Ethnic",
    women_western: "Women's Western", kids: "Kids", bridal: "Bridal",
    uniforms: "Uniforms", alterations: "Alterations", embroidery: "Embroidery", designer: "Designer",
};

export default function TailorProfilePage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [tailor, setTailor] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('portfolio');

    useEffect(() => {
        Promise.all([
            api.get(`/tailors/${id}`).then(d => setTailor(d.tailor)),
            api.get(`/reviews/tailor/${id}?limit=20`).then(d => setReviews(d.reviews || [])).catch(() => { }),
        ]).finally(() => setLoading(false));
    }, [id]);

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) stars.push(<span key={i} className={`star ${i <= Math.round(rating) ? 'filled' : 'empty'}`}>★</span>);
        return <span className="stars">{stars}</span>;
    };

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;
    if (!tailor) return <div className="empty-state" style={{ minHeight: '60vh' }}><h3>Tailor not found</h3></div>;

    const u = tailor.userId || {};
    const minPrice = Math.min(...Object.values(tailor.startingPrices || {}).filter(Boolean));

    return (
        <>
            <div className="page-header">
                <div className="container">
                    <h1>{u.name}</h1>
                    <p>📍 {u.location?.city}, {u.location?.state}</p>
                </div>
            </div>

            <div className="container">
                <div className="profile-header">
                    <img className="profile-avatar" src={u.avatar || ''} alt={u.name} onError={(e) => { e.target.style.background = 'linear-gradient(135deg, var(--primary-200), var(--accent-200))'; e.target.src = ''; }} />
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '6px' }}>{u.name}</h1>
                        <div className="profile-meta">
                            <span>📍 {u.location?.city}, {u.location?.state}</span>
                            <span>⏱️ {tailor.experience} years experience</span>
                            <span>{renderStars(tailor.averageRating)} {tailor.averageRating} ({tailor.totalReviews} reviews)</span>
                            <span>📦 {tailor.totalOrders} orders completed</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                            {tailor.specializations?.map(s => <span key={s} className="badge badge-accent">{SPEC_LABELS[s] || s}</span>)}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '18px', maxWidth: '600px' }}>{tailor.bio}</p>

                        {/* Contact info */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '18px', fontSize: '0.88rem' }}>
                            {u.email && <span style={{ color: 'var(--text-tertiary)' }}>📧 {u.email}</span>}
                            {u.phone && <span style={{ color: 'var(--text-tertiary)' }}>📱 {u.phone}</span>}
                        </div>

                        {/* Service area */}
                        {tailor.serviceArea?.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>Service Area: </span>
                                {tailor.serviceArea.map(a => <span key={a} className="badge badge-info" style={{ marginLeft: '4px' }}>{a}</span>)}
                            </div>
                        )}

                        {user && user.role === 'customer' && (
                            <Link href={`/order/new?tailor=${id}`} className="btn btn-primary btn-lg">Place an Order →</Link>
                        )}
                        {!user && <Link href={`/login?redirect=/tailors/${id}`} className="btn btn-primary">Login to Place Order</Link>}
                    </div>
                </div>

                {/* Starting Prices */}
                {Object.values(tailor.startingPrices || {}).some(Boolean) && (
                    <div style={{ background: 'var(--primary-50)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>💰 Starting Prices</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                            {Object.entries(tailor.startingPrices || {}).filter(([, v]) => v > 0).map(([item, price]) => (
                                <div key={item} style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center', border: '1px solid var(--neutral-200)' }}>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>{item.replace(/_/g, ' ')}</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-700)' }}>₹{price}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="tabs">
                    <button className={`tab ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}>📸 Portfolio ({tailor.portfolio?.length || 0})</button>
                    <button className={`tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>⭐ Reviews ({tailor.totalReviews})</button>
                </div>

                {activeTab === 'portfolio' && (
                    <div className="portfolio-grid" style={{ paddingBottom: '40px' }}>
                        {tailor.portfolio?.length > 0 ? tailor.portfolio.map((item, i) => (
                            <div key={i} className="portfolio-item">
                                <img src={item.imageUrl} alt={item.caption || 'Portfolio'} />
                                {item.caption && <div className="portfolio-item-caption">{item.caption}</div>}
                            </div>
                        )) : (
                            <div className="empty-state"><h3>No portfolio images yet</h3></div>
                        )}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div style={{ paddingBottom: '40px' }}>
                        {reviews.length > 0 ? reviews.map((review) => (
                            <div key={review._id} className="review-card">
                                <div className="review-header">
                                    <div className="review-author">
                                        <div className="review-author-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                            {review.customerId?.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{review.customerId?.name || 'Anonymous'}</div>
                                            <div>{renderStars(review.rating)}</div>
                                        </div>
                                    </div>
                                    <div className="review-date">{new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                                </div>
                                {review.text && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{review.text}</p>}
                                {review.photos?.length > 0 && (
                                    <div className="review-photos">
                                        {review.photos.map((photo, i) => <img key={i} src={photo} alt="Review" />)}
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="empty-state"><h3>No reviews yet</h3><p>Be the first to review this tailor!</p></div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
