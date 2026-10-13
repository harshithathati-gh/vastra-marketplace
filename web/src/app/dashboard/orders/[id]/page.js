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

const COURIER_TRACKING_URLS = {
    'Delhivery': (tracking) => `https://www.delhivery.com/track/package/${tracking}`,
    'BlueDart': (tracking) => `https://www.bluedart.com/tracking?trackNumber=${tracking}`,
    'DTDC': (tracking) => `https://www.dtdc.in/tracking/shipment-tracking.asp?trackingNumber=${tracking}`,
    'Shiprocket': (tracking) => `https://shiprocket.co/tracking/${tracking}`,
    'India Post': (tracking) => `https://www.indiapost.gov.in/_layouts/15/dpt.cpt.tracking/trackconsignment.aspx?consignmentNumber=${tracking}`,
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
    
    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedUpiMethod, setSelectedUpiMethod] = useState('gpay'); // 'gpay', 'bhim', 'phonepe', 'upi_qr', 'card'
    const [paymentLoading, setPaymentLoading] = useState(false);

    // Invoice Modal State
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);
    const [invoiceLoading, setInvoiceLoading] = useState(false);

    // Shipping / Tracking Modal (for Tailors)
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [shippingForm, setShippingForm] = useState({
        courierPartner: 'Delhivery',
        trackingNumber: '',
        trackingUrl: '',
        note: '',
    });

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
            const msgData = await api.get(`/messages/${id}`);
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

    // Load Tax Invoice
    const handleViewInvoice = async () => {
        setShowInvoiceModal(true);
        setInvoiceLoading(true);
        try {
            const res = await api.get(`/orders/${id}/invoice`);
            setInvoiceData(res.invoice);
        } catch (err) {
            alert('Could not fetch invoice: ' + err.message);
            setShowInvoiceModal(false);
        } finally {
            setInvoiceLoading(false);
        }
    };

    // Execute Payment with UPI / GPay / BHIM / Razorpay
    const handleProcessPayment = async () => {
        setPaymentLoading(true);
        const methodLabels = {
            gpay: 'UPI (Google Pay)',
            bhim: 'UPI (BHIM)',
            phonepe: 'UPI (PhonePe)',
            upi_qr: 'UPI (Scan QR)',
            card: 'Card / NetBanking',
        };
        const currentMethodName = methodLabels[selectedUpiMethod] || 'UPI';

        try {
            const data = await api.post(`/orders/${id}/pay`, { paymentType: 'escrow' });
            const isLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

            // If real Razorpay key is present and SDK loaded
            if (isLoaded && window.Razorpay && !data.isSimulator) {
                const options = {
                    key: data.key,
                    amount: Math.round(data.amount * 100),
                    currency: "INR",
                    name: "Vastra Marketplace",
                    description: `Escrow Payment - ${currentMethodName}`,
                    order_id: data.razorpayOrderId.startsWith('rzp_order_') ? undefined : data.razorpayOrderId,
                    prefill: {
                        name: user?.name || order.customerId?.name || "",
                        email: user?.email || order.customerId?.email || "",
                        contact: user?.phone || order.customerId?.phone || "",
                        method: selectedUpiMethod === 'card' ? 'card' : 'upi',
                    },
                    theme: { color: "#6D28D9" },
                    handler: async function (response) {
                        await api.post(`/orders/${id}/verify-payment`, {
                            razorpay_order_id: response.razorpay_order_id || data.razorpayOrderId,
                            razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                            razorpay_signature: response.razorpay_signature || 'verified',
                            paymentMethod: currentMethodName,
                        });
                        setShowPaymentModal(false);
                        loadOrder();
                    },
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                // Direct UPI / Simulator confirmation
                await api.post(`/orders/${id}/verify-payment`, {
                    razorpay_order_id: data.razorpayOrderId,
                    razorpay_payment_id: `upi_${selectedUpiMethod}_${Date.now()}`,
                    razorpay_signature: 'mock_signature',
                    paymentMethod: currentMethodName,
                });
                setShowPaymentModal(false);
                alert(`Payment of ₹${data.amount} successfully processed via ${currentMethodName}! Escrow is now funded.`);
                loadOrder();
            }
        } catch (error) {
            alert("Error completing payment: " + error.message);
        } finally {
            setPaymentLoading(false);
        }
    };

    // Update Shipping Details (for Tailor)
    const handleUpdateShipping = async (e) => {
        e.preventDefault();
        try {
            const autoUrl = COURIER_TRACKING_URLS[shippingForm.courierPartner] 
                ? COURIER_TRACKING_URLS[shippingForm.courierPartner](shippingForm.trackingNumber) 
                : shippingForm.trackingUrl;

            await api.patch(`/orders/${id}/status`, {
                status: 'shipped',
                courierPartner: shippingForm.courierPartner,
                trackingNumber: shippingForm.trackingNumber,
                trackingUrl: shippingForm.trackingUrl || autoUrl,
                note: `Dispatched via ${shippingForm.courierPartner}. Tracking #${shippingForm.trackingNumber}`,
            });
            setShowShippingModal(false);
            loadOrder();
        } catch (err) {
            alert('Failed to update shipping: ' + err.message);
        }
    };

    // Mark Fabric Received (for Tailor)
    const handleMarkFabricReceived = async () => {
        if (!confirm('Confirm that the customer’s fabric has been received and inspected?')) return;
        try {
            await api.patch(`/orders/${id}/status`, {
                status: 'in_progress',
                fabricPickupStatus: 'received_by_tailor',
                note: 'Fabric received and quality inspected by tailor',
            });
            loadOrder();
        } catch (err) {
            alert(err.message);
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
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {order.isEscrowFunded && (
                            <button onClick={handleViewInvoice} className="btn btn-outline btn-sm" style={{ background: 'white' }}>
                                📄 Tax Invoice
                            </button>
                        )}
                        <span className="badge" style={{ background: STATUS_COLORS[order.status] + '20', color: STATUS_COLORS[order.status], fontSize: '0.9rem', padding: '8px 16px' }}>
                            {STATUS_LABELS[order.status]}
                        </span>
                    </div>
                </div>
            </div>

            <div className="container section">
                <div className="order-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>

                    {/* Left - Order details */}
                    <div>
                        {/* Courier Tracking Banner (if Shipped or Delivered) */}
                        {(order.trackingNumber || order.courierPartner) && (
                            <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid #06B6D4', background: '#F0FDFA' }}>
                                <div className="card-body">
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F766E', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        📦 Shipment Tracking ({order.courierPartner || 'Courier'})
                                    </h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#115E59' }}>Waybill / AWB: <strong>{order.trackingNumber}</strong></div>
                                            {order.estimatedDelivery && (
                                                <div style={{ fontSize: '0.82rem', color: '#134E4A', marginTop: '2px' }}>
                                                    Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}
                                                </div>
                                            )}
                                        </div>
                                        {order.trackingUrl && (
                                            <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ background: '#0D9488', borderColor: '#0D9488' }}>
                                                Track on {order.courierPartner} ↗
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fabric Pickup Status (if customer sends fabric) */}
                        {order.fabricPreference === 'self_provided' && (
                            <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid #8B5CF6', background: '#FAF5FF' }}>
                                <div className="card-body">
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#6D28D9', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        🧵 Raw Fabric Pickup Workflow
                                    </h3>
                                    <p style={{ fontSize: '0.88rem', color: '#4C1D95', margin: '0 0 10px' }}>
                                        Customer is providing their own fabric.
                                        Status: <strong>{order.fabricPickupStatus === 'received_by_tailor' ? '✅ Received by Tailor' : (order.fabricPickupStatus || 'Scheduled')}</strong>
                                    </p>
                                    {isTailor && order.fabricPickupStatus !== 'received_by_tailor' && (
                                        <button onClick={handleMarkFabricReceived} className="btn btn-primary btn-sm" style={{ background: '#7C3AED' }}>
                                            Mark Fabric as Received & Inspected
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

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
                                    <div><span style={{ color: 'var(--text-tertiary)' }}>Delivery Type:</span> <strong>{order.deliveryType?.replace(/_/g, ' ')}</strong></div>
                                    {order.deliveryAddress?.city && (
                                        <div><span style={{ color: 'var(--text-tertiary)' }}>Destination:</span> <strong>{order.deliveryAddress.city}, {order.deliveryAddress.state}</strong></div>
                                    )}
                                    {order.estimatedDelivery && <div><span style={{ color: 'var(--text-tertiary)' }}>Est. Delivery:</span> <strong>{new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}</strong></div>}
                                </div>
                                {order.specialInstructions && (
                                    <div style={{ marginTop: '14px' }}>
                                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Special Instructions:</span>
                                        <p style={{ marginTop: '4px', fontSize: '0.9rem' }}>{order.specialInstructions}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Measurements Section */}
                        <div className="card" style={{ marginBottom: '20px' }}>
                            <div className="card-body">
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    📏 {order.measurementProfileName ? `Measurements (${order.measurementProfileName})` : 'Customer Measurements'}
                                </h3>
                                {order.measurements && Object.keys(order.measurements).length > 0 ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', fontSize: '0.9rem' }}>
                                        {Object.entries(
                                            typeof order.measurements.entries === 'function'
                                                ? Object.fromEntries(order.measurements)
                                                : order.measurements
                                        ).map(([key, val]) => (
                                            <div key={key} style={{ background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</div>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{val}"</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)' }}>No custom measurement values attached to this order.</p>
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
                            {isTailor && (order.status === 'in_progress' || order.status === 'accepted') && (
                                <button className="btn btn-primary" onClick={() => setShowShippingModal(true)}>
                                    🚀 Ship & Add Courier Tracking
                                </button>
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
                        <div className="card" style={{ marginBottom: '20px', border: order.isEscrowFunded ? '2px solid #10B981' : (order.status === 'quoted' ? '2px solid #8B5CF6' : 'none') }}>
                            <div className="card-body">
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>💰 Payment & Escrow</span>
                                    {order.isEscrowFunded && (
                                        <span style={{ fontSize: '0.75rem', background: '#DCFCE7', color: '#15803D', padding: '3px 8px', borderRadius: '4px' }}>Paid via {order.paymentMethod || 'UPI'}</span>
                                    )}
                                </h3>

                                {order.totalAmount > 0 ? (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                                            <span>Stitching & Tailoring</span><strong>₹{order.quotedPrice}</strong>
                                        </div>
                                        {order.shippingCost > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                                                <span>Courier & Shipping</span><strong>₹{order.shippingCost}</strong>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, padding: '12px 0', borderTop: '1px solid var(--neutral-200)' }}>
                                            <span>Total (100%)</span><span style={{ color: 'var(--primary-700)' }}>₹{order.totalAmount}</span>
                                        </div>

                                        {order.isEscrowFunded ? (
                                            <div style={{ marginTop: '12px', background: '#ECFDF5', padding: '14px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🛡️</div>
                                                <div style={{ color: '#059669', fontWeight: 700, fontSize: '0.92rem' }}>100% Escrow Secured</div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                                                    Funds are held safely by Vastra. Tailor receives payout once you receive and approve your fit.
                                                </div>
                                                <button onClick={handleViewInvoice} className="btn btn-outline btn-sm" style={{ marginTop: '10px', width: '100%' }}>
                                                    📄 View Official Tax Invoice
                                                </button>
                                            </div>
                                        ) : (
                                            isCustomer && order.status === 'quoted' && (
                                                <div style={{ marginTop: '16px' }}>
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}
                                                        onClick={() => setShowPaymentModal(true)}
                                                    >
                                                        Pay ₹{order.totalAmount} via UPI / Card
                                                    </button>
                                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                        <span>🟢 Google Pay</span>
                                                        <span>•</span>
                                                        <span>🔵 BHIM</span>
                                                        <span>•</span>
                                                        <span>🟣 PhonePe</span>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </>
                                ) : (
                                    <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)' }}>
                                        {order.status === 'placed' || order.status === 'accepted' ? 'Awaiting final quote from tailor based on your custom requirements' : 'No payment required'}
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
                                            📍 {(isCustomer ? order.tailorId?.location : order.customerId?.location)?.city || 'India'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chat Context */}
                        <div className="card">
                            <div className="card-body">
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>💬 Chat with {isCustomer ? 'Tailor' : 'Customer'}</h3>
                                <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '12px' }}>
                                    {messages.length === 0 ? (
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '12px' }}>Start the conversation!</p>
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
                                    <input type="text" className="form-input" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." style={{ flex: 1 }} />
                                    <button type="submit" className="btn btn-primary btn-sm">Send</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* UPI, GPAY, BHIM PAYMENT MODAL */}
            {showPaymentModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: 'white', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Choose Payment Method</h2>
                            <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6B7280' }}>&times;</button>
                        </div>

                        <div style={{ background: '#F9FAFB', borderRadius: '8px', padding: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.9rem', color: '#4B5563' }}>Amount Payable to Escrow:</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6D28D9' }}>₹{order.totalAmount}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                            {[
                                { id: 'gpay', title: 'Google Pay (GPay)', desc: 'Fastest 1-click UPI payment', icon: '🟢' },
                                { id: 'bhim', title: 'BHIM UPI', desc: 'Govt. of India Unified Payments', icon: '🔵' },
                                { id: 'phonepe', title: 'PhonePe UPI', desc: 'Pay via PhonePe app / QR', icon: '🟣' },
                                { id: 'upi_qr', title: 'Any UPI App / Dynamic QR', desc: 'Paytm, Amazon Pay, Any Bank App', icon: '📲' },
                                { id: 'card', title: 'Cards & NetBanking', desc: 'Credit / Debit cards, Net banking', icon: '💳' },
                            ].map((opt) => (
                                <label
                                    key={opt.id}
                                    onClick={() => setSelectedUpiMethod(opt.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                                        borderRadius: '10px', border: selectedUpiMethod === opt.id ? '2px solid #6D28D9' : '1px solid #E5E7EB',
                                        background: selectedUpiMethod === opt.id ? '#F5F3FF' : 'white', cursor: 'pointer'
                                    }}
                                >
                                    <input type="radio" name="paymentOption" checked={selectedUpiMethod === opt.id} onChange={() => setSelectedUpiMethod(opt.id)} style={{ accentColor: '#6D28D9' }} />
                                    <span style={{ fontSize: '1.4rem' }}>{opt.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{opt.title}</div>
                                        <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>{opt.desc}</div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <button
                            onClick={handleProcessPayment}
                            disabled={paymentLoading}
                            className="btn btn-primary btn-full"
                            style={{ padding: '12px', fontSize: '1rem', background: '#6D28D9', borderRadius: '10px' }}
                        >
                            {paymentLoading ? 'Connecting to Gateway...' : `Proceed to Pay ₹${order.totalAmount}`}
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '10px' }}>
                            🔒 256-Bit Encrypted Escrow. Funds held securely under Indian Banking Regulations.
                        </p>
                    </div>
                </div>
            )}

            {/* SHIPPING & TRACKING MODAL (FOR TAILORS) */}
            {showShippingModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: 'white', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Dispatch & Add Tracking</h2>
                            <button onClick={() => setShowShippingModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <form onSubmit={handleUpdateShipping}>
                            <div className="form-group">
                                <label>Courier Partner</label>
                                <select
                                    className="form-select"
                                    value={shippingForm.courierPartner}
                                    onChange={(e) => setShippingForm({ ...shippingForm, courierPartner: e.target.value })}
                                    required
                                >
                                    <option value="Delhivery">Delhivery Logistics</option>
                                    <option value="Shiprocket">Shiprocket Courier Aggregator</option>
                                    <option value="BlueDart">BlueDart Express</option>
                                    <option value="DTDC">DTDC Courier</option>
                                    <option value="India Post">India Post / Speed Post</option>
                                    <option value="Porter">Porter (Same-Day / Intra-City)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tracking Number (AWB / Consignment #)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. 123456789012"
                                    value={shippingForm.trackingNumber}
                                    onChange={(e) => setShippingForm({ ...shippingForm, trackingNumber: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Direct Tracking Link (Optional, auto-generated)</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="https://delhivery.com/track/..."
                                    value={shippingForm.trackingUrl}
                                    onChange={(e) => setShippingForm({ ...shippingForm, trackingUrl: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '12px' }}>
                                Confirm Shipment & Notify Customer
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* OFFICIAL TAX INVOICE MODAL */}
            {showInvoiceModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: 'white', borderRadius: '16px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#6D28D9' }}>VASTRA</h1>
                                <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '2px 0 0' }}>Bespoke Tailoring Marketplace • Tax Invoice</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button onClick={() => window.print()} className="btn btn-outline btn-sm" style={{ marginRight: '8px' }}>
                                    🖨️ Print / Save PDF
                                </button>
                                <button onClick={() => setShowInvoiceModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                                    &times;
                                </button>
                            </div>
                        </div>

                        {invoiceLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>Loading tax invoice...</div>
                        ) : invoiceData ? (
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.88rem', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB', marginBottom: '20px' }}>
                                    <div>
                                        <div style={{ color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase' }}>Invoice Number</div>
                                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1F2937' }}>{invoiceData.invoiceNumber}</div>
                                        <div style={{ color: '#6B7280', marginTop: '4px' }}>Date: {new Date(invoiceData.invoiceDate).toLocaleDateString('en-IN')}</div>
                                        <div style={{ color: '#6B7280' }}>HSN/SAC Code: <strong>{invoiceData.hsnSacCode}</strong></div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase' }}>Billed To</div>
                                        <div style={{ fontWeight: 700 }}>{invoiceData.customer?.name}</div>
                                        <div style={{ color: '#6B7280' }}>{invoiceData.customer?.phone}</div>
                                        <div style={{ color: '#6B7280' }}>{invoiceData.customer?.address?.city}, {invoiceData.customer?.address?.state} {invoiceData.customer?.address?.pincode}</div>
                                    </div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                                            <th style={{ padding: '10px' }}>Description</th>
                                            <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                                            <td style={{ padding: '10px' }}>
                                                <strong>{invoiceData.item?.name}</strong>
                                                <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>Custom Stitching & Fit</div>
                                            </td>
                                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>₹{invoiceData.item?.amount}</td>
                                        </tr>
                                        {invoiceData.shippingCost > 0 && (
                                            <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                                                <td style={{ padding: '10px' }}>Logistics & Courier Delivery</td>
                                                <td style={{ padding: '10px', textAlign: 'right' }}>₹{invoiceData.shippingCost}</td>
                                            </tr>
                                        )}
                                        <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                                            <td style={{ padding: '10px' }}>GST on Services ({invoiceData.gstRate})</td>
                                            <td style={{ padding: '10px', textAlign: 'right' }}>₹{invoiceData.gstAmount}</td>
                                        </tr>
                                        <tr style={{ fontSize: '1rem', fontWeight: 800 }}>
                                            <td style={{ padding: '12px 10px' }}>Total Amount Paid</td>
                                            <td style={{ padding: '12px 10px', textAlign: 'right', color: '#059669' }}>₹{invoiceData.totalAmount}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div style={{ background: '#F9FAFB', borderRadius: '8px', padding: '14px', fontSize: '0.82rem', color: '#4B5563', marginBottom: '20px' }}>
                                    <div><strong>Payment Mode:</strong> {invoiceData.paymentMethod}</div>
                                    <div><strong>Transaction Ref:</strong> {invoiceData.transactionId}</div>
                                    <div><strong>Escrow Status:</strong> {invoiceData.paymentStatus}</div>
                                    <div style={{ marginTop: '6px' }}><strong>Artisan / Tailor:</strong> {invoiceData.tailor?.name}</div>
                                </div>

                                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9CA3AF' }}>
                                    This is a computer-generated tax invoice. No physical signature required.
                                    <br />
                                    Vastra Marketplace Pvt. Ltd. • GSTIN: 27AABCV1234F1Z5
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </>
    );
}
