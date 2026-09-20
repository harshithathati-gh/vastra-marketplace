'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function Home() {
    const [featuredTailors, setFeaturedTailors] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [tailorRes, productRes] = await Promise.all([
                api.get('/tailors?sortBy=rating&limit=6').catch(() => ({ tailors: [] })),
                api.get('/products?limit=8').catch(() => ({ products: [] })),
            ]);
            setFeaturedTailors(tailorRes.tailors || []);
            setProducts(productRes.products || []);
        } catch { /* ignore */ }
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
            {/* HERO */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1>Your Style, <span className="highlight">Perfectly Tailored</span></h1>
                        <p>Connect with India's finest tailors. From everyday kurtas to bridal lehengas — get custom-fitted clothing crafted by skilled artisans, delivered to your doorstep.</p>
                        <div className="hero-actions">
                            <Link href="/tailors" className="btn btn-primary btn-lg">Find a Tailor →</Link>
                            <Link href="/products" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>Browse Designs</Link>
                        </div>
                        <div style={{ display: 'flex', gap: '40px', marginTop: '48px', fontSize: '0.9rem' }}>
                            <div><span style={{ fontSize: '1.6rem', fontWeight: 800, display: 'block', color: 'var(--primary-400)' }}>500+</span>Skilled Tailors</div>
                            <div><span style={{ fontSize: '1.6rem', fontWeight: 800, display: 'block', color: 'var(--primary-400)' }}>50+</span>Cities</div>
                            <div><span style={{ fontSize: '1.6rem', fontWeight: 800, display: 'block', color: 'var(--primary-400)' }}>10K+</span>Happy Customers</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="section" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div className="section-header">
                        <span className="overline">Simple Process</span>
                        <h2>How Vastra Works</h2>
                        <p>Get your dream outfit in just 4 simple steps</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon gold">🔍</div>
                            <h3>1. Browse & Discover</h3>
                            <p>Explore our collection of designs and find the perfect tailor based on your location, budget, and style preferences.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon indigo">📏</div>
                            <h3>2. Share Measurements</h3>
                            <p>Use our guided measurement tool to submit your body measurements. Save profiles for yourself and family members.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon gold">🧵</div>
                            <h3>3. Place Your Order</h3>
                            <p>Choose design options, add your preferences, and submit your order. The tailor will send you a quote to approve.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon green">📦</div>
                            <h3>4. Receive & Review</h3>
                            <p>Your custom-tailored outfit is shipped to your doorstep. Leave a review and share your experience!</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURED PRODUCTS */}
            {products.length > 0 && (
                <section className="section">
                    <div className="container">
                        <div className="section-header">
                            <span className="overline">Our Collection</span>
                            <h2>Popular Tailoring Products</h2>
                            <p>From ethnic wear to western formals — get anything custom-made</p>
                        </div>
                        <div className="product-grid">
                            {products.slice(0, 8).map((product) => (
                                <Link href={`/products/${product._id}`} key={product._id} className="product-card">
                                    <div className="product-card-image">
                                        {product.baseImage ? (
                                            <img src={product.baseImage} alt={product.name} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--primary-100), var(--accent-100))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🧵</div>
                                        )}
                                    </div>
                                    <div className="product-card-body">
                                        <span className="badge badge-primary" style={{ marginBottom: '8px' }}>{product.category} • {product.subCategory}</span>
                                        <h3>{product.name}</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
                                        <div className="product-card-meta">
                                            <span className="product-card-price">₹{product.priceRange?.min || 0} – ₹{product.priceRange?.max || 0}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '36px' }}>
                            <Link href="/products" className="btn btn-outline">View All Products →</Link>
                        </div>
                    </div>
                </section>
            )}

            {/* FEATURED TAILORS */}
            {featuredTailors.length > 0 && (
                <section className="section" style={{ background: 'var(--bg-secondary)' }}>
                    <div className="container">
                        <div className="section-header">
                            <span className="overline">Top Rated</span>
                            <h2>Meet Our Skilled Tailors</h2>
                            <p>Verified professionals with years of experience, ready to bring your designs to life</p>
                        </div>
                        <div className="tailor-grid">
                            {featuredTailors.map((tailor) => (
                                <Link href={`/tailors/${tailor.userId?._id}`} key={tailor._id} className="tailor-card">
                                    <div className="tailor-card-header">
                                        <img
                                            className="tailor-card-avatar"
                                            src={tailor.userId?.avatar || ''}
                                            alt={tailor.userId?.name}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                        <div className="tailor-card-info">
                                            <h3>{tailor.userId?.name}</h3>
                                            <div className="tailor-card-location">
                                                📍 {tailor.userId?.location?.city}, {tailor.userId?.location?.state}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tailor-card-body">
                                        <div className="tailor-card-specs">
                                            {tailor.specializations?.slice(0, 3).map((spec) => (
                                                <span key={spec} className="badge badge-accent">{spec.replace(/_/g, ' ')}</span>
                                            ))}
                                        </div>
                                        <div className="tailor-card-stats">
                                            <span>{renderStars(tailor.averageRating)} <strong>{tailor.averageRating}</strong></span>
                                            <span><strong>{tailor.totalReviews}</strong> reviews</span>
                                            <span><strong>{tailor.experience}</strong> yrs exp</span>
                                        </div>
                                    </div>
                                    <div className="tailor-card-footer">
                                        <div className="tailor-card-price">Starting from <strong>₹{Math.min(...Object.values(tailor.startingPrices || {}).filter(Boolean)) || '—'}</strong></div>
                                        <span className="btn btn-primary btn-sm">View Profile</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '36px' }}>
                            <Link href="/tailors" className="btn btn-accent">Find More Tailors →</Link>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="section" style={{ background: 'linear-gradient(135deg, var(--accent-900), var(--neutral-900))', color: 'white', textAlign: 'center' }}>
                <div className="container">
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: '14px' }}>Are You a Tailor?</h2>
                    <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: '500px', margin: '0 auto 32px', lineHeight: '1.7' }}>
                        Join India's fastest growing tailoring marketplace. Reach customers across the country, manage orders digitally, and grow your business.
                    </p>
                    <Link href="/register?role=tailor" className="btn btn-primary btn-lg">
                        Join as a Tailor for Free →
                    </Link>
                </div>
            </section>
        </>
    );
}
