'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

const SPECIALIZATION_LABELS = {
    men_ethnic: "Men's Ethnic", men_western: "Men's Western", women_ethnic: "Women's Ethnic",
    women_western: "Women's Western", kids: "Kids", bridal: "Bridal",
    uniforms: "Uniforms", alterations: "Alterations", embroidery: "Embroidery", designer: "Designer",
};

export default function TailorsPage() {
    const [tailors, setTailors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({ search: '', specialization: '', city: '', minRating: '', sortBy: 'rating' });

    useEffect(() => { loadTailors(); }, [page, filters.specialization, filters.sortBy, filters.minRating]);

    const loadTailors = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', page);
            params.set('limit', '12');
            if (filters.search) params.set('search', filters.search);
            if (filters.specialization) params.set('specialization', filters.specialization);
            if (filters.city) params.set('city', filters.city);
            if (filters.minRating) params.set('minRating', filters.minRating);
            if (filters.sortBy) params.set('sortBy', filters.sortBy);
            const data = await api.get(`/tailors?${params}`);
            setTailors(data.tailors || []);
            setTotal(data.total || 0);
        } catch { setTailors([]); }
        setLoading(false);
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(<span key={i} className={`star ${i <= Math.round(rating) ? 'filled' : 'empty'}`}>★</span>);
        }
        return <span className="stars">{stars}</span>;
    };

    return (
        <>
            <div className="page-header">
                <div className="container">
                    <h1>Find Tailors</h1>
                    <p>Discover skilled tailors across India — filter by specialization, location, and ratings</p>
                </div>
            </div>

            <div className="container">
                <div className="filters-bar">
                    <form suppressHydrationWarning onSubmit={(e) => { e.preventDefault(); loadTailors(); }} className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input suppressHydrationWarning type="text" className="form-input" placeholder="Search by name or city..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
                    </form>
                    <select suppressHydrationWarning className="form-select" value={filters.specialization} onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}>
                        <option value="">All Specializations</option>
                        {Object.entries(SPECIALIZATION_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                    </select>
                    <select suppressHydrationWarning className="form-select" value={filters.minRating} onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}>
                        <option value="">Any Rating</option>
                        <option value="4">4+ Stars</option>
                        <option value="4.5">4.5+ Stars</option>
                    </select>
                    <select suppressHydrationWarning className="form-select" value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}>
                        <option value="rating">Top Rated</option>
                        <option value="experience">Most Experienced</option>
                        <option value="reviews">Most Reviews</option>
                        <option value="newest">Newest</option>
                    </select>
                </div>

                <div style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)', marginBottom: '16px' }}>{total} tailors found</div>

                {loading ? (
                    <div className="loading-page"><div className="spinner" /></div>
                ) : tailors.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🧵</div>
                        <h3>No tailors found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        <div className="tailor-grid" style={{ paddingBottom: '20px' }}>
                            {tailors.map((tailor) => (
                                <Link href={`/tailors/${tailor.userId?._id}`} key={tailor._id} className="tailor-card">
                                    <div className="tailor-card-header">
                                        {tailor.userId?.avatar ? (
                                            <img
                                                className="tailor-card-avatar"
                                                src={tailor.userId.avatar}
                                                alt={tailor.userId?.name}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <div className="tailor-card-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-100)', color: 'var(--primary-800)', fontWeight: 700, fontSize: '1.2rem' }}>
                                                {tailor.userId?.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="tailor-card-info">
                                            <h3>{tailor.userId?.name}</h3>
                                            <div className="tailor-card-location">📍 {tailor.userId?.location?.city}, {tailor.userId?.location?.state}</div>
                                        </div>
                                    </div>
                                    <div className="tailor-card-body">
                                        <div className="tailor-card-specs">
                                            {tailor.specializations?.slice(0, 3).map((spec) => (
                                                <span key={spec} className="badge badge-accent">{SPECIALIZATION_LABELS[spec] || spec}</span>
                                            ))}
                                            {tailor.specializations?.length > 3 && <span className="badge badge-info">+{tailor.specializations.length - 3}</span>}
                                        </div>
                                        <div className="tailor-card-stats">
                                            <span>{renderStars(tailor.averageRating)} <strong>{tailor.averageRating}</strong></span>
                                            <span><strong>{tailor.totalReviews}</strong> reviews</span>
                                            <span><strong>{tailor.experience}</strong> yrs</span>
                                        </div>
                                        {tailor.bio && <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginTop: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tailor.bio}</p>}
                                    </div>
                                    <div className="tailor-card-footer">
                                        <div className="tailor-card-price">From <strong>₹{Math.min(...Object.values(tailor.startingPrices || {}).filter(Boolean)) || '—'}</strong></div>
                                        <span className="btn btn-primary btn-sm">View Profile →</span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {total > 12 && (
                            <div className="pagination">
                                {Array.from({ length: Math.ceil(total / 12) }, (_, i) => (
                                    <button key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
