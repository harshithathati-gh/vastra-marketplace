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
            } else if ((p && p.type && (p.type.toLowerCase().includes('trouser') || p.type.toLowerCase().includes('pant'))) || (p && p.name && (p.name.toLowerCase().includes('trouser') || p.name.toLowerCase().includes('pant')))) {
                p.images = [
                    'https://i.pinimg.com/736x/55/2f/23/552f23546bc2d85028bb1819b7f38112.jpg',
                    'https://i.pinimg.com/736x/1f/df/5a/1fdf5a33c2bcb082b082dd3b951cfeca0387.jpg',
                    'https://i.pinimg.com/736x/8b/d5/25/8bd5258c997ad8f0d8f0de63003c1fc79529.jpg'
                ];
                p.baseImage = p.images[0];
                p.category = 'Women and Men';
                p.subCategory = 'Western';
            } else if ((p && p.type && p.type.toLowerCase().includes('long kurti')) || (p && p.name && p.name.toLowerCase().includes('long kurti'))) {
                p.images = [
                    'https://i.pinimg.com/736x/da/e8/8d/dae88d148a7c8d0e933e1b58a042e5e3.jpg',
                    'https://i.pinimg.com/736x/f7/94/e4/f794e44c1b78be501b4e6d8e37330614.jpg',
                    'https://i.pinimg.com/736x/86/8c/ac/868cacc690924811468575180c2b6a62.jpg',
                    'https://i.pinimg.com/736x/60/6f/2f/606f2f5cb9fe973e27334973be8d7ff4.jpg',
                    'https://i.pinimg.com/736x/65/1a/ca/651acaf25d77755205a497cda4fdd41a.jpg'
                ];
                p.baseImage = p.images[0];
                p.category = 'Women';
                p.subCategory = 'Ethnic';
                p.name = 'Long Kurti';
            } else if ((p && p.type && p.type.toLowerCase().includes('kurti')) || (p && p.name && p.name.toLowerCase().includes('kurti'))) {
                p.images = [
                    'https://i.pinimg.com/736x/e5/13/e6/e513e678c13bde8ac5c08fe8cf12aadf.jpg',
                    'https://i.pinimg.com/736x/16/cf/0d/16cf0df40ffc10e5ecb56310fefa5171.jpg',
                    'https://i.pinimg.com/736x/17/c6/50/17c650f944b744ba9819210b53844b32.jpg',
                    'https://i.pinimg.com/736x/b6/9c/e6/b69ce675e7692e3461e47081a4c827ad.jpg',
                    'https://i.pinimg.com/736x/4b/6a/04/4b6a0414bff7b713462859159af76479.jpg'
                ];
                p.baseImage = p.images[0];
                p.category = 'Women';
                p.subCategory = 'Ethnic';
                p.name = 'Short Kurti';
            } else if ((p && p.type && p.type.toLowerCase().includes('anarkali')) || (p && p.name && p.name.toLowerCase().includes('anarkali'))) {
                p.images = [
                    'https://i.pinimg.com/736x/f0/c0/16/f0c01698833dce7ddd481692b3b8945a.jpg',
                    'https://i.pinimg.com/736x/f3/26/45/f32645bbb642d578734387f057eec9fb.jpg',
                    'https://i.pinimg.com/736x/4b/e7/f5/4be7f55da121b2186ad2934cf6e668f3.jpg',
                    'https://i.pinimg.com/736x/20/de/6d/20de6d110fe131ca7cf4e59d4b9b73ec.jpg',
                    'https://i.pinimg.com/736x/0d/42/e7/0d42e73300ec837dd4fe97821d309a30.jpg'
                ];
                p.baseImage = p.images[0];
                p.category = 'Women';
                p.subCategory = 'Ethnic';
                p.name = 'Anarkali';
            } else if ((p && p.type && p.type.toLowerCase().includes('salwar suit')) || (p && p.name && p.name.toLowerCase().includes('salwar suit'))) {
                p.images = [
                    'https://i.pinimg.com/736x/09/f3/34/09f3340a331e5afb171c9a5f30e2866d.jpg',
                    'https://i.pinimg.com/736x/e2/87/1d/e2871dd91f8ceed3170386c8808a18d7.jpg',
                    'https://i.pinimg.com/736x/2a/0d/a6/2a0da67f925e1c6ef1cd98c827111fb0.jpg',
                    'https://i.pinimg.com/736x/28/c0/d8/28c0d8339e5bb652f271675ba79c34ed.jpg',
                    'https://i.pinimg.com/736x/99/c7/a9/99c7a937255c1040e591ff2b6b1fd95b.jpg'
                ];
                p.baseImage = p.images[0];
                p.category = 'Women';
                p.subCategory = 'Ethnic';
                p.name = 'Salwar Suit';
            } else if ((p && p.type && p.type.toLowerCase().includes('half saree')) || (p && p.name && p.name.toLowerCase().includes('half saree'))) {
                p.images = [
                    'https://i.pinimg.com/736x/59/61/65/596165f685556d117ac3772b6d365114.jpg',
                    'https://i.pinimg.com/736x/c9/8b/64/c98b6412c339d308eef8980181134da8.jpg',
                    'https://i.pinimg.com/736x/d8/81/eb/d881ebdf64b967f6e6aa2bfb6f899cfa.jpg',
                    'https://i.pinimg.com/736x/95/8c/33/958c33882191210f927853f0ba9aab9f.jpg',
                    'https://i.pinimg.com/736x/bd/29/f5/bd29f50404de41ed595a98165b4cff73.jpg'
                ];
                p.baseImage = p.images[0];
                p.category = 'Women';
                p.subCategory = 'Ethnic';
                p.name = 'Half Saree';
            } else if ((p && p.type && p.type.toLowerCase().includes('lehenga')) || (p && p.name && p.name.toLowerCase().includes('lehenga'))) {
                p.images = [
                    'https://i.pinimg.com/736x/5e/33/8b/5e338b5b1879403d62debf567c0815ac.jpg',
                    'https://i.pinimg.com/736x/c9/87/58/c98758417d002c776550e3d1ca38834e.jpg',
                    'https://i.pinimg.com/736x/31/6d/0b/316d0b59aea1e70d04f2fd9b31dace6f.jpg',
                    'https://i.pinimg.com/736x/c9/fa/6a/c9fa6acb7400324dc8cfeae9e894e70c.jpg',
                    'https://i.pinimg.com/736x/76/7e/eb/767eeb2238732b18801b933dc9e838df.jpg'
                ];
                p.baseImage = p.images[0];
                p.category = 'Women';
                p.subCategory = 'Ethnic';
                p.name = 'Lehenga';
            } else if ((p && p.type && p.type.toLowerCase().includes('kids kurta')) || (p && p.name && p.name.toLowerCase().includes('kids kurta'))) {
                p.images = [
                    'https://i.pinimg.com/736x/53/7a/9a/537a9a645807af620561f68b803b6a68.jpg',
                    'https://i.pinimg.com/736x/f8/79/bc/f879bcc01a1b96a277847fad2cb4c8d7.jpg',
                    'https://i.pinimg.com/736x/a8/3f/3c/a83f3c05bb8fd7dd0db3f20de900087c.jpg',
                    'https://i.pinimg.com/736x/d3/12/41/d3124105eb6cf3d7543620382c222dcb.jpg',
                    'https://i.pinimg.com/736x/e5/82/32/e582320cd0b9c9de51c98b5e36f3f0e7.jpg'
                ];
                p.baseImage = p.images[0];
                p.category = 'Men and Women';
                p.subCategory = 'Ethnic';
                p.name = 'Kids Kurta Set';
            } else if (p && p.type && p.type.toLowerCase().includes('kurta')) {
                p.images = [
                    'https://i.pinimg.com/736x/66/29/df/6629df3409765ea18978413656a578fb.jpg',
                    'https://i.pinimg.com/736x/50/ea/67/50ea673373376398d4eb383c61612170.jpg',
                    'https://i.pinimg.com/736x/f5/be/35/f5be3564d449a957ceae2b78add3217c.jpg',
                    'https://i.pinimg.com/736x/73/b2/18/73b21866a386fed2e446b9529906cc16.jpg',
                    'https://i.pinimg.com/736x/be/f6/27/bef6271c7ca7e6767e1c4e35b56fd442.jpg'
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
                                        <img src={img} alt={`${product.name} thumbnail ${i + 1}`} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
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
