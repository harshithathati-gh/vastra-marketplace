'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_COLORS = {
    placed: '#3B82F6', accepted: '#8B5CF6', rejected: '#EF4444', quoted: '#F59E0B',
    in_progress: '#6366F1', shipped: '#06B6D4', delivered: '#10B981', disputed: '#F97316', cancelled: '#6B7280',
};
const STATUS_LABELS = {
    placed: 'Order Placed', accepted: 'Accepted', rejected: 'Rejected', quoted: 'Price Quoted',
    in_progress: 'In Progress', shipped: 'Shipped', delivered: 'Delivered', disputed: 'Disputed', cancelled: 'Cancelled',
};

export default function OrderDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });
    const [showReview, setShowReview] = useState(false);

    useEffect(() => {
        loadOrder();
    }, [id]);

    const loadOrder = async () => {
        try {
            const data = await api.get(`/orders/${id}`);
            setOrder(data.order);
            const msgData = await api.get(`/messages/${id}`).catch(() => ({ messages: [] }));
            setMessages(msgData.messages || []);
        } catch { }
        setLoading(false);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            await api.post('/messages', { orderId: id, content: newMessage });
            setNewMessage('');
            const msgData = await api.get(`/messages/${id}`);
            setMessages(msgData.messages || []);
        } catch { }
    };

    const cancelOrder = async () => {
        if (!confirm('Are you sure you want to cancel?')) return;
        try {
            await api.patch(`/orders/${id}/status`, { status: 'cancelled' });
            loadOrder();
        } catch { }
    };

    const submitReview = async () => {
        try {
            await api.post('/reviews', { orderId: id, rating: reviewForm.rating, text: reviewForm.text });
            setShowReview(false);
            alert('Review submitted!');
        } catch (err) { alert(err.message); }
    };

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;
    if (!order) return <div className="empty-state" style={{ minHeight: '60vh' }}><h3>Order not found</h3></div>;

    const isCustomer = user?.role === 'customer';
    const isTailor = user?.role === 'tailor';

    return (
        <>
            <div className="page-header">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Order: {order.product?.name}</h1>
                        <p>Order ID: {order._id}</p>
                    </div>
                    <span className="badge" style={{ background: STATUS_COLORS[order.status] + '20', color: STATUS_COLORS[order.status], fontSize: '0.9rem', padding: '8px 16px' }}>
                        {STATUS_LABELS[order.status]}
                    </span>
                </div>
            </div>

            <div className="container section">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
                    {/* Left - Order details */}
                    <div>
                        {/* Status Timeline */}
                        <div className="card" style={{ marginBottom: '20px' }}>
                            <div className="card-body">
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Order Timeline</h3>
                                <div className="order-timeline">
                                    {order.statusHistory?.map((entry, i) => (
                                        <div key={i} className={`timeline-item ${i === order.statusHistory.length - 1 ? 'current' : 'completed'}`}>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{STATUS_LABELS[entry.status] || entry.status}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                                {new Date(entry.changedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </div>
                                            {entry.note && <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{entry.note}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="card" style={{ marginBottom: '20px' }}>
                            <div className="card-body">
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>Order Details</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9rem' }}>
                                    <div><span style={{ color: 'var(--text-tertiary)' }}>Product:</span> <strong>{order.product?.name}</strong></div>
                                    <div><span style={{ color: 'var(--text-tertiary)' }}>Fabric:</span> <strong>{order.fabricPreference?.replace(/_/g, ' ')}</strong></div>
                                    <div><span style={{ color: 'var(--text-tertiary)' }}>Delivery:</span> <strong>{order.deliveryType?.replace(/_/g, ' ')}</strong></div>
                                    {order.estimatedDelivery && <div><span style={{ color: 'var(--text-tertiary)' }}>Est. Delivery:</span> <strong>{new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}</strong></div>}
                                    {order.trackingNumber && <div><span style={{ color: 'var(--text-tertiary)' }}>Tracking:</span> <strong>{order.trackingNumber}</strong></div>}
                                </div>
                                {order.specialInstructions && (
                                    <div style={{ marginTop: '14px' }}>
                                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Special Instructions:</span>
                                        <p style={{ marginTop: '4px', fontSize: '0.9rem' }}>{order.specialInstructions}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Design Choices */}
                        {order.product?.designChoices && Object.values(order.product.designChoices).some(Boolean) && (
                            <div className="card" style={{ marginBottom: '20px' }}>
                                <div className="card-body">
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px' }}>Design Choices</h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {Object.entries(order.product.designChoices).filter(([, v]) => v).map(([k, v]) => (
                                            <span key={k} className="badge badge-accent">{k}: {v}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {isCustomer && order.status === 'placed' && (
                                <button className="btn btn-outline" onClick={cancelOrder} style={{ color: 'var(--error)' }}>Cancel Order</button>
                            )}
                            {isCustomer && order.status === 'delivered' && (
                                <button className="btn btn-primary" onClick={() => setShowReview(true)}>⭐ Write a Review</button>
                            )}
                        </div>

                        {/* Review Form */}
                        {showReview && (
                            <div className="card" style={{ marginTop: '20px' }}>
                                <div className="card-body">
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Write a Review</h3>
                                    <div className="form-group">
                                        <label>Rating</label>
                                        <div className="stars" style={{ fontSize: '1.5rem', cursor: 'pointer' }}>
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <span key={i} className={`star ${i <= reviewForm.rating ? 'filled' : 'empty'}`} onClick={() => setReviewForm({ ...reviewForm, rating: i })}>★</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Your Review</label>
                                        <textarea className="form-textarea" value={reviewForm.text} onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })} placeholder="Share your experience..." />
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="btn btn-primary" onClick={submitReview}>Submit Review</button>
                                        <button className="btn btn-outline" onClick={() => setShowReview(false)}>Cancel</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right - Payment & Chat */}
                    <div>
                        {/* Payment Summary */}
                        <div className="card" style={{ marginBottom: '20px' }}>
                            <div className="card-body">
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>💰 Payment</h3>
                                {order.totalAmount > 0 ? (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                                            <span>Quoted Price</span><strong>₹{order.quotedPrice}</strong>
                                        </div>
                                        {order.shippingCost > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                                                <span>Shipping</span><strong>₹{order.shippingCost}</strong>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, padding: '12px 0', borderTop: '1px solid var(--neutral-200)' }}>
                                            <span>Total</span><span style={{ color: 'var(--primary-700)' }}>₹{order.totalAmount}</span>
                                        </div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                                            Advance: ₹{order.advancePaid || 0} · Balance: ₹{order.balancePaid || 0}
                                        </div>
                                    </>
                                ) : (
                                    <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)' }}>
                                        {order.status === 'placed' || order.status === 'accepted' ? 'Awaiting quote from tailor' : 'No payment required'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Tailor / Customer info */}
                        <div className="card" style={{ marginBottom: '20px' }}>
                            <div className="card-body">
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px' }}>{isCustomer ? '🧵 Tailor' : '👤 Customer'}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className="navbar-avatar">{(isCustomer ? order.tailorId?.name : order.customerId?.name)?.charAt(0)}</div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{isCustomer ? order.tailorId?.name : order.customerId?.name}</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
                                            📍 {(isCustomer ? order.tailorId?.location : order.customerId?.location)?.city}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chat */}
                        <div className="card">
                            <div className="card-body">
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>💬 Messages</h3>
                                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '12px' }}>
                                    {messages.length === 0 ? (
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px' }}>No messages yet. Start a conversation!</p>
                                    ) : messages.map((msg) => (
                                        <div key={msg._id} style={{
                                            marginBottom: '10px', padding: '8px 12px', borderRadius: 'var(--radius-md)',
                                            background: msg.senderId?._id === user?._id || msg.senderId === user?._id ? 'var(--accent-50)' : 'var(--neutral-100)',
                                            marginLeft: msg.senderId?._id === user?._id || msg.senderId === user?._id ? '30px' : '0',
                                            marginRight: msg.senderId?._id === user?._id || msg.senderId === user?._id ? '0' : '30px',
                                        }}>
                                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>{msg.senderId?.name || 'You'}</div>
                                            <div style={{ fontSize: '0.88rem' }}>{msg.content}</div>
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={sendMessage} style={{ display: 'flex', gap: '8px' }}>
                                    <input type="text" className="form-input" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." style={{ flex: 1 }} />
                                    <button type="submit" className="btn btn-primary btn-sm">Send</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
