'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [pendingTailors, setPendingTailors] = useState([]);
    const [orders, setOrders] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [finance, setFinance] = useState(null);
    const [contactMessages, setContactMessages] = useState([]);

    useEffect(() => {
        if (authLoading) return;
        if (!user || user.role !== 'admin') { router.push('/login'); return; }
        loadDashboard();
    }, [user, authLoading]);

    useEffect(() => {
        if (activeTab === 'users') loadUsers();
        if (activeTab === 'tailors') loadPendingTailors();
        if (activeTab === 'orders') loadOrders();
        if (activeTab === 'reviews') loadReviews();
        if (activeTab === 'finances') loadFinance();
        if (activeTab === 'support') loadContactMessages();
    }, [activeTab]);

    const loadDashboard = async () => {
        try {
            const data = await api.get('/admin/dashboard');
            setDashboard(data);
        } catch { }
        setLoading(false);
    };

    const loadUsers = async () => {
        try { const data = await api.get('/admin/users?limit=50'); setUsers(data.users || []); } catch { }
    };

    const loadPendingTailors = async () => {
        try { const data = await api.get('/admin/tailors/pending'); setPendingTailors(data.tailors || []); } catch { }
    };

    const loadOrders = async () => {
        try { const data = await api.get('/admin/orders?limit=50'); setOrders(data.orders || []); } catch { }
    };

    const loadReviews = async () => {
        try { const data = await api.get('/admin/reviews?limit=50'); setReviews(data.reviews || []); } catch { }
    };

    const loadFinance = async () => {
        try { const data = await api.get('/admin/finance'); setFinance(data); } catch { }
    };

    const loadContactMessages = async () => {
        try { const data = await api.get('/contact'); setContactMessages(data.messages || []); } catch { }
    };

    const updateContactStatus = async (id, status) => {
        try {
            await api.patch(`/contact/${id}/status`, { status });
            loadContactMessages();
        } catch (err) { alert(err.message); }
    };

    const verifyTailor = async (tailorId, status) => {
        try {
            await api.patch(`/admin/tailors/${tailorId}/verify`, { status });
            loadPendingTailors();
            loadDashboard();
        } catch (err) { alert(err.message); }
    };

    const toggleUserStatus = async (userId, isActive) => {
        try {
            await api.patch(`/admin/users/${userId}`, { isActive: !isActive });
            loadUsers();
        } catch (err) { alert(err.message); }
    };

    const toggleReview = async (reviewId, isActive) => {
        try {
            await api.patch(`/admin/reviews/${reviewId}`, { isActive: !isActive });
            loadReviews();
        } catch (err) { alert(err.message); }
    };

    if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;

    return (
        <div className="dashboard">
            {/* Sidebar */}
            <div className="dashboard-sidebar">
                <div style={{ padding: '0 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700 }}>Va<span style={{ color: 'var(--primary-400)' }}>stra</span></div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Admin Panel</div>
                </div>
                {[
                    { key: 'overview', icon: '📊', label: 'Dashboard' },
                    { key: 'users', icon: '👥', label: 'Users' },
                    { key: 'tailors', icon: '🧵', label: 'Tailor Verification' },
                    { key: 'orders', icon: '📦', label: 'Orders' },
                    { key: 'finances', icon: '💰', label: 'Finances & Escrow' },
                    { key: 'reviews', icon: '⭐', label: 'Reviews' },
                    { key: 'support', icon: '💬', label: 'Support Tickets' },
                ].map(item => (
                    <a key={item.key} className={activeTab === item.key ? 'active' : ''} onClick={() => setActiveTab(item.key)} style={{ cursor: 'pointer' }}>
                        <span>{item.icon}</span> {item.label}
                    </a>
                ))}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '20px', paddingTop: '12px' }}>
                    <Link href="/" style={{ padding: '12px 24px', display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>← Back to Site</Link>
                </div>
            </div>

            {/* Content */}
            <div className="dashboard-content">
                {/* Overview Tab */}
                {activeTab === 'overview' && dashboard && (
                    <>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px' }}>Platform Overview</h2>
                        <div className="stats-grid">
                            <div className="stat-card"><div className="stat-label">Total Users</div><div className="stat-value">{dashboard.totalUsers || 0}</div></div>
                            <div className="stat-card"><div className="stat-label">Customers</div><div className="stat-value">{dashboard.totalCustomers || 0}</div></div>
                            <div className="stat-card"><div className="stat-label">Tailors</div><div className="stat-value">{dashboard.totalTailors || 0}</div></div>
                            <div className="stat-card"><div className="stat-label">Total Orders</div><div className="stat-value">{dashboard.totalOrders || 0}</div></div>
                            <div className="stat-card"><div className="stat-label">Revenue</div><div className="stat-value" style={{ color: 'var(--success)' }}>₹{dashboard.totalRevenue || 0}</div></div>
                            <div className="stat-card"><div className="stat-label">Pending Tailors</div><div className="stat-value" style={{ color: 'var(--warning)' }}>{dashboard.pendingTailors || 0}</div></div>
                            <div className="stat-card"><div className="stat-label">Active Orders</div><div className="stat-value" style={{ color: 'var(--accent-500)' }}>{dashboard.activeOrders || 0}</div></div>
                            <div className="stat-card"><div className="stat-label">Disputes</div><div className="stat-value" style={{ color: 'var(--error)' }}>{dashboard.openDisputes || 0}</div></div>
                        </div>
                    </>
                )}

                {/* Finances Tab */}
                {activeTab === 'finances' && finance && (
                    <>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px' }}>Platform Finances & Escrow Ledger</h2>
                        <div className="stats-grid" style={{ marginBottom: '32px' }}>
                            <div className="stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
                                <div className="stat-label">Currently Held in Escrow</div>
                                <div className="stat-value" style={{ color: 'var(--warning)' }}>₹{finance.summary?.escrowHeld || 0}</div>
                            </div>
                            <div className="stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
                                <div className="stat-label">Total Paid Out to Tailors</div>
                                <div className="stat-value" style={{ color: 'var(--success)' }}>₹{finance.summary?.totalPaidOutToTailors || 0}</div>
                            </div>
                            <div className="stat-card" style={{ borderLeft: '4px solid var(--primary-500)' }}>
                                <div className="stat-label">Platform Earnings (Commission)</div>
                                <div className="stat-value" style={{ color: 'var(--primary-500)' }}>₹{finance.summary?.platformEarnings || 0}</div>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Escrow Ledger</h3>
                        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid var(--neutral-200)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                                <thead>
                                    <tr style={{ background: 'var(--neutral-100)', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 16px' }}>Order ID</th>
                                        <th style={{ padding: '12px 16px' }}>Customer</th>
                                        <th style={{ padding: '12px 16px' }}>Tailor</th>
                                        <th style={{ padding: '12px 16px' }}>Total Amount</th>
                                        <th style={{ padding: '12px 16px' }}>Commission</th>
                                        <th style={{ padding: '12px 16px' }}>Tailor Cut</th>
                                        <th style={{ padding: '12px 16px' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {finance.ledger?.map(item => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                                            <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{item.id.substring(0, 8)}</td>
                                            <td style={{ padding: '12px 16px' }}>{item.customerName}</td>
                                            <td style={{ padding: '12px 16px' }}>{item.tailorName}</td>
                                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>₹{item.totalAmount}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--primary-600)' }}>₹{item.commission}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--success)' }}>₹{item.tailorPayout}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span className={`badge ${item.escrowStatus === 'held' ? 'badge-warning' : item.escrowStatus === 'released' ? 'badge-success' : 'badge-error'}`}>
                                                    {item.escrowStatus?.toUpperCase() || 'UNKNOWN'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!finance.ledger || finance.ledger.length === 0) && (
                                        <tr><td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)' }}>No escrow transactions recorded.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px' }}>User Management</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                                <thead>
                                    <tr style={{ background: 'var(--neutral-100)', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 16px' }}>Name</th>
                                        <th style={{ padding: '12px 16px' }}>Email</th>
                                        <th style={{ padding: '12px 16px' }}>Role</th>
                                        <th style={{ padding: '12px 16px' }}>Location</th>
                                        <th style={{ padding: '12px 16px' }}>Status</th>
                                        <th style={{ padding: '12px 16px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u._id} style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>{u.name}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-tertiary)' }}>{u.email}</td>
                                            <td style={{ padding: '12px 16px' }}><span className={`badge ${u.role === 'admin' ? 'badge-error' : u.role === 'tailor' ? 'badge-accent' : 'badge-info'}`}>{u.role}</span></td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-tertiary)' }}>{u.location?.city}</td>
                                            <td style={{ padding: '12px 16px' }}><span className={`badge ${u.isActive !== false ? 'badge-success' : 'badge-error'}`}>{u.isActive !== false ? 'Active' : 'Disabled'}</span></td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <button onClick={() => toggleUserStatus(u._id, u.isActive !== false)} className="btn btn-outline btn-sm" style={{ fontSize: '0.78rem' }}>
                                                    {u.isActive !== false ? 'Disable' : 'Enable'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Tailor Verification Tab */}
                {activeTab === 'tailors' && (
                    <>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px' }}>Pending Tailor Verification</h2>
                        {pendingTailors.length === 0 ? (
                            <div className="empty-state"><h3>No pending verifications</h3></div>
                        ) : pendingTailors.map((t) => (
                            <div key={t._id} className="card" style={{ padding: '20px 24px', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontWeight: 700, marginBottom: '4px' }}>{t.userId?.name}</h3>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                                            📍 {t.userId?.location?.city}, {t.userId?.location?.state} · {t.experience} yrs exp · 📧 {t.userId?.email}
                                        </div>
                                        {t.bio && <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>{t.bio}</p>}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            {t.specializations?.map(s => <span key={s} className="badge badge-accent">{s}</span>)}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn btn-primary btn-sm" onClick={() => verifyTailor(t._id, 'approved')}>✅ Approve</button>
                                        <button className="btn btn-outline btn-sm" style={{ color: 'var(--error)' }} onClick={() => verifyTailor(t._id, 'rejected')}>❌ Reject</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px' }}>All Orders</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                                <thead>
                                    <tr style={{ background: 'var(--neutral-100)', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 16px' }}>Product</th>
                                        <th style={{ padding: '12px 16px' }}>Customer</th>
                                        <th style={{ padding: '12px 16px' }}>Tailor</th>
                                        <th style={{ padding: '12px 16px' }}>Status</th>
                                        <th style={{ padding: '12px 16px' }}>Amount</th>
                                        <th style={{ padding: '12px 16px' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o._id} style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>{o.product?.name}</td>
                                            <td style={{ padding: '12px 16px' }}>{o.customerId?.name}</td>
                                            <td style={{ padding: '12px 16px' }}>{o.tailorId?.name}</td>
                                            <td style={{ padding: '12px 16px' }}><span className="badge badge-info">{o.status}</span></td>
                                            <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--primary-700)' }}>₹{o.totalAmount || 0}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-tertiary)' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                    <>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px' }}>Review Moderation</h2>
                        {reviews.length === 0 ? (
                            <div className="empty-state"><h3>No reviews</h3></div>
                        ) : reviews.map(r => (
                            <div key={r._id} className="card" style={{ padding: '16px 20px', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} by {r.customerId?.name || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>for {r.tailorId?.name || 'Unknown Tailor'} · {new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                                        {r.text && <p style={{ fontSize: '0.88rem' }}>{r.text}</p>}
                                    </div>
                                    <button onClick={() => toggleReview(r._id, r.isActive)} className={`btn btn-sm ${r.isActive !== false ? 'btn-outline' : 'btn-primary'}`} style={{ fontSize: '0.78rem' }}>
                                        {r.isActive !== false ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
                {/* Support Tickets Tab */}
                {activeTab === 'support' && (
                    <>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px' }}>Support Tickets</h2>
                        {contactMessages.length === 0 ? (
                            <div className="empty-state"><h3>No messages</h3></div>
                        ) : contactMessages.map(msg => (
                            <div key={msg._id} className="card" style={{ padding: '16px 20px', marginBottom: '10px', borderLeft: msg.status === 'new' ? '4px solid var(--accent-500)' : 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{msg.name} <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>({msg.email})</span></div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: '10px' }}>{new Date(msg.createdAt).toLocaleString('en-IN')}</div>
                                        <div style={{ fontSize: '0.92rem', background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                                            {msg.message}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', marginLeft: '20px' }}>
                                        <span className={`badge ${msg.status === 'new' ? 'badge-accent' : msg.status === 'archived' ? 'badge-error' : 'badge-info'}`}>{msg.status.toUpperCase()}</span>
                                        {msg.status === 'new' && (
                                            <button onClick={() => updateContactStatus(msg._id, 'read')} className="btn btn-sm btn-outline" style={{ fontSize: '0.78rem' }}>Mark Read</button>
                                        )}
                                        {msg.status !== 'archived' && (
                                            <button onClick={() => updateContactStatus(msg._id, 'archived')} className="btn btn-sm" style={{ fontSize: '0.78rem', color: 'var(--error)' }}>Archive</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
