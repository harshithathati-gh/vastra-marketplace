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
                // Fetch orders for customer
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
            formData.append('photos', file); // 'photos' is the multer field name, automatically handles mp4/mov too.
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

    if (authLoading) return <div className="container section">Loading...</div>;
    if (!user) return null;

    return (
        <div className="container section" style={{ maxWidth: '800px', minHeight: '80vh' }}>
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h1>Write a Review</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Share your crafting experience, photos, and videos.</p>
            </div>

            {successMessage ? (
                <div style={{ padding: '30px', background: '#dcfce7', color: '#166534', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <h3>🎉 {successMessage}</h3>
                    <button className="btn btn-outline" style={{ marginTop: '20px' }} onClick={() => setSuccessMessage('')}>Write Another Review</button>
                    <Link href="/products" className="btn btn-primary" style={{ marginLeft: '10px' }}>Browse Products</Link>
                </div>
            ) : orders.length === 0 ? (
                <div style={{ padding: '50px 20px', background: 'white', borderRadius: 'var(--radius-lg)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🛍️</div>
                    <h3>No Orders Found</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>You haven't placed any orders yet. Place an order to review a tailor!</p>
                    <Link href="/products" className="btn btn-primary">Start Shopping</Link>
                </div>
            ) : (
                <div style={{ background: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Select Order</label>
                            <select
                                className="input"
                                value={selectedOrderId}
                                onChange={(e) => setSelectedOrderId(e.target.value)}
                                required
                            >
                                <option value="" disabled>Select an order...</option>
                                {orders.map(o => (
                                    <option key={o._id} value={o._id}>
                                        Order #{o._id.substring(0, 8).toUpperCase()} - {o.product?.name || 'Custom Outfit'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Rating</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setRating(star)}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            fontSize: '2rem', color: rating >= star ? '#fbbf24' : '#e5e7eb',
                                            transition: 'color 0.2s'
                                        }}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Review Text</label>
                            <textarea
                                className="input"
                                rows="5"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="How was the fit, fabric, and overall service?"
                                required
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>Upload Media (Photos & Videos)</label>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
                                Share up to 5 photos or videos of your finished outfit. Max 50MB per file.
                            </p>
                            <input
                                type="file"
                                className="input"
                                multiple
                                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                                onChange={handleFileChange}
                                style={{ padding: '10px' }}
                            />
                            {mediaFiles.length > 0 && (
                                <ul style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--primary)' }}>
                                    {mediaFiles.map((file, i) => <li key={i}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>)}
                                </ul>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={submitting}
                        >
                            {submitting ? 'Uploading to Cloudinary...' : 'Submit Review'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
