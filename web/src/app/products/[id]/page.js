'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(null);

    useEffect(() => {
        api.get(`/products/${id}`).then(data => {
            const p = data.product;
            if (p && p.type && p.type.toLowerCase().includes('blouse')) {
                p.images = [
                    'https://designerblouse.co/blog/wp-content/uploads/2024/07/cotton-printed-blouse.jpg',
                    'https://designerblouse.co/blog/wp-content/uploads/2024/04/Embellished-puff-sleeve.webp',
                    'https://i.pinimg.com/736x/d1/c2/2a/d1c22a08045399045d148067cbb5df38.jpg',
                    'https://i.pinimg.com/originals/86/cf/9e/86cf9e9124eb0cae2cc0009dd27710d9.jpg',
                    'https://tse1.explicit.bing.net/th/id/OIP.skM9KldSGM2xl80YI4MtSAHaL2?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'
                ];
                p.baseImage = p.images[0];
            } else if (p && p.type && p.type.toLowerCase().includes('dress')) {
                p.images = [
                    'https://i.pinimg.com/736x/43/5c/cd/435ccdef1ce3d36b1055d997a7feebf6.jpg',
                    'https://www.ever-pretty.co.uk/cdn/shop/files/eg02335og-r_e3e959e6-f2be-468d-be85-390983950443.jpg?v=1738408207',
                    'https://n.nordstrommedia.com/it/3109ff01-cec4-435f-b28e-a663a528bb7c.jpeg?h=368&w=240&dpr=2',
                    'https://n.nordstrommedia.com/it/74b80e93-873f-4804-a717-71017095b4a3.jpeg?h=368&w=240&dpr=2',
                    'https://www.weddingforward.com/wp-content/uploads/2023/03/ball-gown-wedding-dresses-nicole-milano.jpg'
                ];
                p.baseImage = p.images[0];
            } else if (p && p.type && p.type.toLowerCase().includes('shirt')) {
                p.images = [
                    'https://cdn.shopify.com/s/files/1/0266/6276/4597/files/Group_1-03_28e7cab7-92f1-46f0-a5c0-30194b1ae35e.jpg?v=1665137073',
                    'https://m.media-amazon.com/images/I/610NaWLzXvL._AC_SL1500_.jpg',
                    'https://www.gulahmedshop.com/cdn/shop/files/Men-Dress-Shirts-Color-Black-100_-Cotton-Modern-Fit-FS-PLN25-335-Half-Front_940x.jpg?v=1766746917',
                    'https://i.etsystatic.com/54837021/r/il/2c4135/7814821425/il_fullxfull.7814821425_kch0.jpg',
                    'https://i.pinimg.com/736x/be/68/d7/be68d76ddfd76938ef9bcc549aee8c48.jpg'
                ];
                p.baseImage = p.images[0];
            } else if (p && p.type && (p.type.toLowerCase().includes('trouser') || p.type.toLowerCase().includes('pant'))) {
                p.images = [
                    'https://offduty.in/cdn/shop/files/709492DD-63BB-47DE-AD1B-09616FDE2AB1_1400x.jpg?v=1708772536',
                    'https://i.pinimg.com/236x/9e/65/75/9e65759819549f2ce2385cb8509c0402.jpg',
                    '/trousers_1.png',
                    '/trousers_2.png',
                    'https://down-ph.img.susercontent.com/file/sg-11134201-7rbm5-ln6ltbar2cz03a'
                ];
                p.baseImage = p.images[0];
            }
            setProduct(p);
            if (p) setActiveImg(p.baseImage || (p.images && p.images[0]));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;
    if (!product) return <div className="empty-state" style={{ minHeight: '60vh' }}><h3>Product not found</h3></div>;

    return (
        <>
            <div className="container section">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px', alignItems: 'flex-start' }}>
                    {/* Images Gallery */}
                    <div style={{ flex: '1 1 min(100%, 400px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--neutral-100)' }}>
                            {activeImg ? (
                                <img src={activeImg} alt={product.name} style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', aspectRatio: '4/5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', background: 'linear-gradient(135deg, var(--primary-100), var(--accent-100))' }}>🧵</div>
                            )}
                        </div>

                        {/* Gallery Thumbnails */}
                        {product.images && product.images.length > 0 && (
                            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'thin' }}>
                                {(product.baseImage && !product.images.includes(product.baseImage) ? [product.baseImage, ...product.images] : product.images).map((img, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            flex: '0 0 calc(33.333% - 8px)',
                                            borderRadius: 'var(--radius-md)',
                                            overflow: 'hidden',
                                            aspectRatio: '4/5',
                                            boxShadow: 'var(--shadow-sm)',
                                            cursor: 'pointer',
                                            border: activeImg === img ? '2px solid var(--primary-500)' : '2px solid transparent',
                                            transition: 'border-color 0.2s ease'
                                        }}
                                        onClick={() => setActiveImg(img)}
                                    >
                                        <img src={img} alt={`${product.name} design ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
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
