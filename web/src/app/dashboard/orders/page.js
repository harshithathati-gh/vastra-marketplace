'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const STATUS_COLORS = {
    placed: '#3B82F6', accepted: '#8B5CF6', rejected: '#EF4444', quoted: '#F59E0B',
    in_progress: '#6366F1', shipped: '#06B6D4', delivered: '#10B981', disputed: '#F97316', cancelled: '#6B7280',
};
const STATUS_LABELS = {
    placed: 'Order Placed', accepted: 'Accepted', rejected: 'Rejected', quoted: 'Price Quoted',
    in_progress: 'In Progress', shipped: 'Shipped', delivered: 'Delivered', disputed: 'Disputed', cancelled: 'Cancelled',
};

export default function CustomerOrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        if (authLoading) return;
        if (!user) { router.push('/login'); return; }
        loadOrders();
    }, [user, authLoading, statusFilter]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const params = statusFilter ? `?status=${statusFilter}` : '';
            const data = await api.get(`/orders${params}`);
            setOrders(data.orders || []);
        } catch { setOrders([]); }
        setLoading(false);
    };

    if (authLoading) return <div className="loading-page"><div className="spinner" /></div>;

    return (
        <>
            <div className="page-header">
                <div className="container">
                    <h1>My Orders</h1>
                    <p>Track and manage your tailoring orders</p>
                </div>
            </div>

            <div className="container section">
                <div className="filters-bar">
                    <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Orders</option>
                        {Object.entries(STATUS_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                    </select>
                </div>

                {loading ? (
                    <div className="loading-page"><div className="spinner" /></div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <h3>No orders yet</h3>
                        <p>Find a tailor and place your first order!</p>
                        <Link href="/tailors" className="btn btn-primary" style={{ marginTop: '16px' }}>Browse Tailors</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {orders.map((order) => (
                            <Link href={`/dashboard/orders/${order._id}`} key={order._id} className="card" style={{ display: 'flex', padding: '20px 24px', gap: '20px', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                        <span style={{ fontWeight: 700 }}>{order.product?.name || order.product?.type}</span>
                                        <span className="badge" style={{ background: STATUS_COLORS[order.status] + '20', color: STATUS_COLORS[order.status] }}>{STATUS_LABELS[order.status]}</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                                        Tailor: {order.tailorId?.name} · {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                                {order.totalAmount > 0 && (
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-700)' }}>₹{order.totalAmount}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Paid: ₹{(order.advancePaid || 0) + (order.balancePaid || 0)}</div>
                                    </div>
                                )}
                                <span style={{ color: 'var(--text-tertiary)', fontSize: '1.2rem' }}>→</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
