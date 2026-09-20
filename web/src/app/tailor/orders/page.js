'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_COLORS = {
    placed: '#3B82F6', accepted: '#8B5CF6', rejected: '#EF4444', quoted: '#F59E0B',
    in_progress: '#6366F1', shipped: '#06B6D4', delivered: '#10B981',
};
const STATUS_LABELS = {
    placed: 'New', accepted: 'Accepted', rejected: 'Rejected', quoted: 'Quoted',
    in_progress: 'In Progress', shipped: 'Shipped', delivered: 'Delivered',
};

export default function TailorOrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [quoteModal, setQuoteModal] = useState(null);
    const [quoteForm, setQuoteForm] = useState({ quotedPrice: '', shippingCost: '', estimatedDelivery: '' });

    useEffect(() => { loadOrders(); }, [filter]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const params = filter ? `?status=${filter}` : '';
            const data = await api.get(`/orders${params}`);
            setOrders(data.orders || []);
        } catch { setOrders([]); }
        setLoading(false);
    };

    const updateStatus = async (orderId, status, extra = {}) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status, ...extra });
            loadOrders();
        } catch (err) { alert(err.message); }
    };

    const sendQuote = async () => {
        try {
            await api.patch(`/orders/${quoteModal}/quote`, {
                quotedPrice: parseFloat(quoteForm.quotedPrice),
                shippingCost: parseFloat(quoteForm.shippingCost) || 0,
                estimatedDelivery: quoteForm.estimatedDelivery,
            });
            setQuoteModal(null);
            loadOrders();
        } catch (err) { alert(err.message); }
    };

    return (
        <>
            <div className="page-header">
                <div className="container"><h1>Orders Management</h1><p>Accept, quote, and manage customer orders</p></div>
            </div>

            <div className="container section">
                <div className="filters-bar">
                    {['', 'placed', 'accepted', 'quoted', 'in_progress', 'shipped', 'delivered'].map(s => (
                        <button key={s} className={`btn btn-sm ${filter === s ? 'btn-accent' : 'btn-outline'}`} onClick={() => setFilter(s)}>
                            {s ? STATUS_LABELS[s] : 'All'}{s === 'placed' ? ' 🔔' : ''}
                        </button>
                    ))}
                </div>

                {loading ? <div className="loading-page"><div className="spinner" /></div> : orders.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">📦</div><h3>No orders</h3></div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {orders.map((order) => (
                            <div key={order._id} className="card" style={{ padding: '20px 24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 700 }}>{order.product?.name}</span>
                                            <span className="badge" style={{ background: (STATUS_COLORS[order.status] || '#888') + '20', color: STATUS_COLORS[order.status] }}>{STATUS_LABELS[order.status]}</span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                                            Customer: {order.customerId?.name} · {order.customerId?.location?.city} · {new Date(order.createdAt).toLocaleDateString('en-IN')}
                                        </div>
                                    </div>
                                    {order.totalAmount > 0 && <div style={{ fontWeight: 800, color: 'var(--primary-700)' }}>₹{order.totalAmount}</div>}
                                </div>

                                {/* Order summary */}
                                {order.specialInstructions && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px', fontStyle: 'italic' }}>"{order.specialInstructions}"</p>}

                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <Link href={`/dashboard/orders/${order._id}`} className="btn btn-outline btn-sm">View Details</Link>
                                    {order.status === 'placed' && (
                                        <>
                                            <button className="btn btn-primary btn-sm" onClick={() => updateStatus(order._id, 'accepted')}>✅ Accept</button>
                                            <button className="btn btn-outline btn-sm" style={{ color: 'var(--error)' }} onClick={() => { const reason = prompt('Rejection reason?'); if (reason) updateStatus(order._id, 'rejected', { rejectReason: reason }); }}>❌ Reject</button>
                                        </>
                                    )}
                                    {(order.status === 'accepted' || order.status === 'placed') && (
                                        <button className="btn btn-accent btn-sm" onClick={() => { setQuoteModal(order._id); setQuoteForm({ quotedPrice: '', shippingCost: '', estimatedDelivery: '' }); }}>💰 Send Quote</button>
                                    )}
                                    {order.status === 'quoted' && <button className="btn btn-primary btn-sm" onClick={() => updateStatus(order._id, 'in_progress')}>🧵 Start Working</button>}
                                    {order.status === 'in_progress' && (
                                        <button className="btn btn-primary btn-sm" onClick={() => {
                                            const tracking = prompt('Enter tracking number (optional):');
                                            updateStatus(order._id, 'shipped', { trackingNumber: tracking || '' });
                                        }}>📦 Mark Shipped</button>
                                    )}
                                    {order.status === 'shipped' && <button className="btn btn-primary btn-sm" onClick={() => updateStatus(order._id, 'delivered')}>✅ Mark Delivered</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Quote Modal */}
                {quoteModal && (
                    <div className="modal-overlay" onClick={() => setQuoteModal(null)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header"><h3>Send Price Quote</h3><button className="modal-close" onClick={() => setQuoteModal(null)}>×</button></div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Price (₹)</label>
                                    <input type="number" className="form-input" value={quoteForm.quotedPrice} onChange={(e) => setQuoteForm({ ...quoteForm, quotedPrice: e.target.value })} placeholder="e.g. 2500" />
                                </div>
                                <div className="form-group">
                                    <label>Shipping Cost (₹)</label>
                                    <input type="number" className="form-input" value={quoteForm.shippingCost} onChange={(e) => setQuoteForm({ ...quoteForm, shippingCost: e.target.value })} placeholder="e.g. 150" />
                                </div>
                                <div className="form-group">
                                    <label>Estimated Delivery Date</label>
                                    <input type="date" className="form-input" value={quoteForm.estimatedDelivery} onChange={(e) => setQuoteForm({ ...quoteForm, estimatedDelivery: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-outline" onClick={() => setQuoteModal(null)}>Cancel</button>
                                <button className="btn btn-primary" onClick={sendQuote}>Send Quote</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
