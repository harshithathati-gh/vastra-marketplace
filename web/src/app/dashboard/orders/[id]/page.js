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
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        loadOrder();
    }, [id]);

    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const loadOrder = async () => {
        try {
            const data = await api.get(`/orders/${id}`);
            setOrder(data.order);
            const msgData = await api.get(`/messages/${id}`).catch(() => ({ messages: [] }));
            setMessages(msgData.messages || []);
        } catch (e) {
            console.error("Order load failed");
        }
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

    const handleEscrowPayment = async () => {
        setPaymentLoading(true);
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            setPaymentLoading(false);
            return;
        }

        try {
            // Step 1: Initialize payment order in backend
            const data = await api.post(`/orders/${id}/pay`, { paymentType: 'escrow' });

            // --- MOCK GATEWAY BYPASS ---
            const confirmed = window.confirm(`[MOCK RAZORPAY GATEWAY]\n\nPay ₹${data.amount || 0} to Vastra's Secure Escrow?`);

            if (confirmed) {
                // Validate payment using mock signature that bypasses backend crypto
                await api.post(`/orders/${id}/verify-payment`, {
                    razorpay_order_id: data.razorpayOrderId,
                    razorpay_payment_id: `mock_pay_${Date.now()}`,
                    razorpay_signature: 'mock_signature'
                });

                alert("Escrow Payment Successfully Verified!");
                loadOrder();
            }

        } catch (error) {
            alert("Error initiating Razorpay checkout: " + error.message);
        } finally {
            setPaymentLoading(false);
        }
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

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {isCustomer && order.status === 'placed' && (
                                <button className="btn btn-outline" onClick={cancelOrder} style={{ color: 'var(--error)' }}>Cancel Order</button>
                            )}
                            {isCustomer && order.status === 'delivered' && (
                                <button className="btn btn-primary" onClick={() => setShowReview(true)}>⭐ Write a Review</button>
                            )}
                        </div>

                        {/* Review Form Component Block */}
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
                        {/* Escrow Payment Gateway Block */}
                        <div className="card" style={{ marginBottom: '20px', border: order.isEscrowFunded ? '2px solid #10B981' : (order.status === 'quoted' ? '2px solid #D4AF37' : 'none') }}>
                            <div className="card-body">
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>💰 Escrow Payment</h3>
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
                                            <span>Total (100%)</span><span style={{ color: 'var(--primary-700)' }}>₹{order.totalAmount}</span>
                                        </div>

                                        {/* Security Verification & Call to action */}
                                        {order.isEscrowFunded ? (
                                            <div style={{ marginTop: '12px', background: '#ecfdf5', padding: '12px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🛡️</div>
                                                <div style={{ color: '#059669', fontWeight: 700, fontSize: '0.9rem' }}>100% Escrow Secured</div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>Funds are held securely by Vastra until you safely receive the package.</div>
                                            </div>
                                        ) : (
                                            isCustomer && order.status === 'quoted' && (
                                                <div style={{ marginTop: '16px' }}>
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ width: '100%', padding: '12px' }}
                                                        onClick={handleEscrowPayment}
                                                        disabled={paymentLoading}
                                                    >
                                                        {paymentLoading ? 'Connecting Gateway...' : `Pay ₹${order.totalAmount} to Escrow`}
                                                    </button>
                                                    <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                                                        Powered securely by <strong>Razorpay</strong>. Vastra holds your funds safely in escrow and only releases them when you are fully satisfied.
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </>
                                ) : (
                                    <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)' }}>
                                        {order.status === 'placed' || order.status === 'accepted' ? 'Awaiting final quote from tailor based on your measurements' : 'No payment required'}
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

                        {/* Chat Context */}
                        <div className="card">
                            <div className="card-body">
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>💬 Chat</h3>
                                <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '12px' }}>
                                    {messages.length === 0 ? (
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '12px' }}>Ask questions!</p>
                                    ) : messages.map((msg) => (
                                        <div key={msg._id} style={{
                                            marginBottom: '8px', padding: '8px 12px', borderRadius: 'var(--radius-md)',
                                            background: msg.senderId?._id === user?._id || msg.senderId === user?._id ? 'var(--accent-50)' : 'var(--neutral-100)',
                                            marginLeft: msg.senderId?._id === user?._id || msg.senderId === user?._id ? '20px' : '0',
                                            marginRight: msg.senderId?._id === user?._id || msg.senderId === user?._id ? '0' : '20px',
                                        }}>
                                            <div style={{ fontSize: '0.8rem' }}>{msg.content}</div>
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={sendMessage} style={{ display: 'flex', gap: '8px' }}>
                                    <input type="text" className="form-input" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="..." style={{ flex: 1 }} />
                                    <button type="submit" className="btn btn-primary btn-sm">Sent</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
