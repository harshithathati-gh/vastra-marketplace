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

            // Apply aesthetic image overrides directly into the grid array logic globally to bypass DB defaults
            const mappedProducts = (data.products || []).map(p => {
                if (p.type && p.type.toLowerCase().includes('blouse')) {
                    p.baseImage = 'https://designerblouse.co/blog/wp-content/uploads/2024/07/cotton-printed-blouse.jpg';
                } else if (p.type && p.type.toLowerCase().includes('dress')) {
                    p.baseImage = 'https://i.pinimg.com/736x/43/5c/cd/435ccdef1ce3d36b1055d997a7feebf6.jpg';
                } else if ((p.type && (p.type.toLowerCase().includes('trouser') || p.type.toLowerCase().includes('pant'))) || (p.name && (p.name.toLowerCase().includes('trouser') || p.name.toLowerCase().includes('pant')))) {
                    p.baseImage = 'https://i.pinimg.com/736x/10/93/10/1093108140833387077.jpg';
                    p.category = 'Women and Men';
                    p.subCategory = 'Western';
                } else if (p.type && p.type.toLowerCase().includes('long kurti')) {
                    p.baseImage = 'https://i.pinimg.com/736x/da/e8/8d/dae88d148a7c8d0e933e1b58a042e5e3.jpg';
                    p.category = 'Women';
                    p.subCategory = 'Ethnic';
                    p.name = 'Long Kurti';
                } else if (p.type && p.type.toLowerCase().includes('kurti')) {
                    p.baseImage = 'https://i.pinimg.com/736x/e5/13/e6/e513e678c13bde8ac5c08fe8cf12aadf.jpg';
                    p.category = 'Women';
                    p.subCategory = 'Ethnic';
                    p.name = 'Short Kurti';
                } else if ((p.type && p.type.toLowerCase().includes('anarkali')) || (p.name && p.name.toLowerCase().includes('anarkali'))) {
                    p.baseImage = 'https://i.pinimg.com/736x/f0/c0/16/f0c01698833dce7ddd481692b3b8945a.jpg';
                    p.category = 'Women';
                    p.subCategory = 'Ethnic';
                    p.name = 'Anarkali';
                } else if ((p.type && p.type.toLowerCase().includes('salwar suit')) || (p.name && p.name.toLowerCase().includes('salwar suit'))) {
                    p.baseImage = 'https://i.pinimg.com/736x/09/f3/34/09f3340a331e5afb171c9a5f30e2866d.jpg';
                    p.category = 'Women';
                    p.subCategory = 'Ethnic';
                    p.name = 'Salwar Suit';
                } else if ((p.type && p.type.toLowerCase().includes('half saree')) || (p.name && p.name.toLowerCase().includes('half saree'))) {
                    p.baseImage = 'https://i.pinimg.com/736x/59/61/65/596165f685556d117ac3772b6d365114.jpg';
                    p.category = 'Women';
                    p.subCategory = 'Ethnic';
                    p.name = 'Half Saree';
                } else if ((p.type && p.type.toLowerCase().includes('lehenga')) || (p.name && p.name.toLowerCase().includes('lehenga'))) {
                    p.baseImage = 'https://i.pinimg.com/736x/5e/33/8b/5e338b5b1879403d62debf567c0815ac.jpg';
                    p.category = 'Women';
                    p.subCategory = 'Ethnic';
                    p.name = 'Lehenga';
                } else if ((p.type && p.type.toLowerCase().includes('kids kurta')) || (p.name && p.name.toLowerCase().includes('kids kurta'))) {
                    p.baseImage = 'https://i.pinimg.com/736x/53/7a/9a/537a9a645807af620561f68b803b6a68.jpg';
                    p.category = 'Men and Women';
                    p.subCategory = 'Ethnic';
                    p.name = 'Kids Kurta Set';
                } else if (p.type && p.type.toLowerCase().includes('kurta')) {
                    p.baseImage = 'https://i.pinimg.com/736x/66/29/df/6629df3409765ea18978413656a578fb.jpg';
                } else if (p.type && p.type.toLowerCase().includes('shirt')) {
                    p.baseImage = 'https://cdn.shopify.com/s/files/1/0266/6276/4597/files/Group_1-03_28e7cab7-92f1-46f0-a5c0-30194b1ae35e.jpg?v=1665137073';
                }
                return p;
            });

            setProducts(mappedProducts);
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
                    <form suppressHydrationWarning onSubmit={handleSearch} className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input suppressHydrationWarning type="text" className="form-input" placeholder="Search products..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
                    </form>
                    <select suppressHydrationWarning className="form-select" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                        <option value="">All Categories</option>
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="kids">Kids</option>
                    </select>
                    <select suppressHydrationWarning className="form-select" value={filters.subCategory} onChange={(e) => setFilters({ ...filters, subCategory: e.target.value })}>
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
