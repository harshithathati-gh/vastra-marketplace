'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const STATUS_LABELS = {
    placed: 'Order Placed', accepted: 'Accepted', rejected: 'Rejected', quoted: 'Price Quoted',
    in_progress: 'In Progress', shipped: 'Shipped', delivered: 'Delivered', disputed: 'Disputed',
};

export default function TailorDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user || user.role !== 'tailor') { router.push('/login'); return; }
        loadData();
    }, [user, authLoading]);

    const loadData = async () => {
        try {
            const [meData, ordersData] = await Promise.all([
                api.get('/auth/me'),
                api.get('/orders?limit=10'),
            ]);
            setProfile(meData.user?.tailorProfile);
            setOrders(ordersData.orders || []);
        } catch { }
        setLoading(false);
    };

    if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;

    const pendingOrders = orders.filter(o => o.status === 'placed').length;
    const activeOrders = orders.filter(o => ['accepted', 'quoted', 'in_progress'].includes(o.status)).length;

    return (
        <>
            <div className="page-header">
                <div className="container">
                    <h1>Welcome, {user?.name}!</h1>
                    <p>
                        {profile?.verificationStatus === 'pending' && '⏳ Your profile is pending verification'}
                        {profile?.verificationStatus === 'approved' && '✅ Your profile is verified and live'}
                        {profile?.verificationStatus === 'rejected' && '❌ Your profile was not approved'}
                    </p>
                </div>
            </div>

            <div className="container section">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Pending Orders</div>
                        <div className="stat-value" style={{ color: 'var(--warning)' }}>{pendingOrders}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Active Orders</div>
                        <div className="stat-value" style={{ color: 'var(--accent-500)' }}>{activeOrders}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Total Completed</div>
                        <div className="stat-value" style={{ color: 'var(--success)' }}>{profile?.totalOrders || 0}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Average Rating</div>
                        <div className="stat-value" style={{ color: 'var(--primary-600)' }}>⭐ {profile?.averageRating || 0}</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Quick Actions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link href="/tailor/orders" className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '1.4rem' }}>📦</span>
                                <div><div style={{ fontWeight: 600 }}>Manage Orders</div><div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>View and manage incoming orders</div></div>
                            </Link>
                            <Link href="/tailor/profile" className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '1.4rem' }}>✏️</span>
                                <div><div style={{ fontWeight: 600 }}>Edit Profile</div><div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Update bio, portfolio, and prices</div></div>
                            </Link>
                            <Link href="/dashboard/messages" className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '1.4rem' }}>💬</span>
                                <div><div style={{ fontWeight: 600 }}>Messages</div><div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Chat with customers</div></div>
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Recent Orders</h2>
                        {orders.length === 0 ? (
                            <div className="empty-state" style={{ padding: '32px' }}><h3>No orders yet</h3></div>
                        ) : orders.slice(0, 5).map((order) => (
                            <Link href={`/dashboard/orders/${order._id}`} key={order._id} className="card" style={{ padding: '12px 16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{order.product?.name}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{order.customerId?.name} · {new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
                                </div>
                                <span className="badge badge-info">{STATUS_LABELS[order.status]}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
