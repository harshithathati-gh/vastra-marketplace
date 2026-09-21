'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ReviewsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [selectedOrderId, setSelectedOrderId] = useState('');
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');
    const [mediaFiles, setMediaFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user) return;
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders');
                const orderData = res.orders || res.data || [];
                setOrders(orderData);
            } catch (err) {
                console.error(err);
            }
        };
        fetchOrders();
    }, [user]);

    const handleFileChange = (e) => {
        if (e.target.files) {
            setMediaFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');

        if (!selectedOrderId) return alert('Please select an order to review.');

        setSubmitting(true);
        const order = orders.find(o => o._id === selectedOrderId);

        const formData = new FormData();
        const tailorId = typeof order.tailorId === 'object' ? order.tailorId._id : order.tailorId;
        formData.append('tailorId', tailorId);
        formData.append('orderId', selectedOrderId);
        formData.append('rating', rating);
        formData.append('text', text);

        mediaFiles.forEach(file => {
            formData.append('photos', file);
        });

        try {
            await api.post('/reviews', formData);
            setSuccessMessage('Your review has been posted successfully! Thank you for sharing your feedback.');
            setText('');
            setMediaFiles([]);
            setRating(5);
            setSelectedOrderId('');
        } catch (err) {
            alert(err.message || 'Error posting review. You may have already reviewed this order.');
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading) return <div className="loading-page"><div className="spinner" /></div>;
    if (!user) return null;

    return (
        <>
            <div className="page-header">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Write a Review</h1>
                        <p>Share your crafting experience, photos, and videos</p>
                    </div>
                </div>
            </div>

            <div className="container section">
                {successMessage ? (
                    <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                        <div className="card-body" style={{ padding: '40px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
                            <h3 style={{ color: 'var(--success)', marginBottom: '16px' }}>Success!</h3>
                            <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>{successMessage}</p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                                <button className="btn btn-outline" onClick={() => setSuccessMessage('')}>Write Another Review</button>
                                <Link href="/products" className="btn btn-primary">Browse Products</Link>
                            </div>
                        </div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🛍️</div>
                        <h3>No Orders Found</h3>
                        <p>You haven't placed any orders yet. Place an order to review a tailor!</p>
                        <Link href="/products" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>Start Shopping</Link>
                    </div>
                ) : (
                    <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Select Order</label>
                                    <select
                                        className="form-select"
                                        value={selectedOrderId}
                                        onChange={(e) => setSelectedOrderId(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Select a completed order...</option>
                                        {orders.map(o => (
                                            <option key={o._id} value={o._id}>
                                                Order #{o._id.substring(0, 8).toUpperCase()} - {o.product?.name || 'Custom Outfit'}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Rating</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                type="button"
                                                key={star}
                                                onClick={() => setRating(star)}
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    fontSize: '2rem', color: rating >= star ? '#fbbf24' : '#e5e7eb',
                                                    transition: 'color 0.2s', padding: 0
                                                }}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Review Details</label>
                                    <textarea
                                        className="form-input"
                                        rows="5"
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="How was the fit, fabric, and overall service?"
                                        required
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <label>Upload Media (Photos & Videos)</label>
                                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '8px' }}>
                                        Share up to 5 photos or videos of your finished outfit. Max 50MB per file.
                                    </p>
                                    <input
                                        type="file"
                                        className="form-input"
                                        multiple
                                        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                                        onChange={handleFileChange}
                                        style={{ padding: '8px 12px' }}
                                    />
                                    {mediaFiles.length > 0 && (
                                        <ul style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--primary)', listStyle: 'inside' }}>
                                            {mediaFiles.map((file, i) => <li key={i}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>)}
                                        </ul>
                                    )}
                                </div>

                                <div style={{ marginTop: '24px' }}>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        style={{ width: '100%' }}
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Uploading to Cloudinary...' : 'Submit Review'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
