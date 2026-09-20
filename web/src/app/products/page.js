'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ category: '', subCategory: '', search: '' });

    useEffect(() => { loadProducts(); }, [filters.category, filters.subCategory]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.category) params.set('category', filters.category);
            if (filters.subCategory) params.set('subCategory', filters.subCategory);
            if (filters.search) params.set('search', filters.search);
            params.set('limit', '50');
            const data = await api.get(`/products?${params}`);
            setProducts(data.products || []);
        } catch { setProducts([]); }
        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadProducts();
    };

    return (
        <>
            <div className="page-header">
                <div className="container">
                    <h1>Browse Products</h1>
                    <p>Explore our collection of tailorable clothing designs</p>
                </div>
            </div>

            <div className="container">
                <div className="filters-bar">
                    <form onSubmit={handleSearch} className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input type="text" className="form-input" placeholder="Search products..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
                    </form>
                    <select className="form-select" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                        <option value="">All Categories</option>
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="kids">Kids</option>
                    </select>
                    <select className="form-select" value={filters.subCategory} onChange={(e) => setFilters({ ...filters, subCategory: e.target.value })}>
                        <option value="">All Styles</option>
                        <option value="ethnic">Ethnic</option>
                        <option value="western">Western</option>
                        <option value="fusion">Fusion</option>
                    </select>
                </div>

                {loading ? (
                    <div className="loading-page"><div className="spinner" /></div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🧵</div>
                        <h3>No products found</h3>
                        <p>Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="product-grid" style={{ paddingBottom: '40px' }}>
                        {products.map((product) => (
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
                                        <span className="product-card-price">₹{product.priceRange?.min} – ₹{product.priceRange?.max}</span>
                                        <span className="btn btn-primary btn-sm">View</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
