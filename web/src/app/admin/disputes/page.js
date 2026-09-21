'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function AdminDisputesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'admin') {
                router.push('/');
            } else {
                fetchDisputes();
            }
        }
    }, [user, authLoading, router]);

    const fetchDisputes = async () => {
        try {
            const res = await api.get('/admin/disputes');
            setDisputes(res.disputes || res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, actionType) => {
        if (!confirm(`Are you sure you want to ${actionType.replace('_', ' ')}? This action is permanent and affects the escrow funds.`)) return;

        setProcessingId(id);
        const payload = actionType === 'refund_customer'
            ? { status: 'refunded', adminNotes: 'Admin ruled in favor of customer.', resolution: 'Full refund issued from Escrow.' }
            : { status: 'resolved', adminNotes: 'Admin ruled in favor of tailor.', resolution: 'Funds released to tailor.' };

        try {
            await api.patch(`/admin/disputes/${id}`, payload);
            alert(`Dispute successfully updated and ${actionType === 'refund_customer' ? 'refunded' : 'released'}!`);
            fetchDisputes();
        } catch (err) {
            alert('Failed to process action: ' + err.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;

    const openDisputes = disputes.filter(d => d.status === 'open' || d.status === 'under_review');
    const closedDisputes = disputes.filter(d => d.status === 'resolved' || d.status === 'refunded');

    return (
        <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh', paddingBottom: '60px' }}>
            <div className="page-header" style={{ background: '#1e293b', color: 'white' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ color: 'white' }}>Escrow Dispute Center</h1>
                        <p style={{ color: '#94a3b8' }}>Moderate doorstep rejections and manage funds safely</p>
                    </div>
                </div>
            </div>

            <div className="container section">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
                        <div className="card-body">
                            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700 }}>Action Required</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>{openDisputes.length}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Open Escalations</div>
                        </div>
                    </div>
                    <div className="card" style={{ borderLeft: '4px solid #22c55e' }}>
                        <div className="card-body">
                            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700 }}>Resolved History</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>{closedDisputes.length}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Settled Disputes</div>
                        </div>
                    </div>
                </div>

                <h3 style={{ marginBottom: '16px' }}>Pending Moderation ({openDisputes.length})</h3>

                {openDisputes.length === 0 ? (
                    <div className="empty-state" style={{ background: 'white' }}>
                        <div className="empty-icon">✅</div>
                        <h3>All Clear</h3>
                        <p>There are no active disputes requiring admin attention.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {openDisputes.map(dispute => (
                            <div key={dispute._id} className="card">
                                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '12px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Order Reference</div>
                                            <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>#{dispute.orderId?._id?.substring(0, 8).toUpperCase()}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Raised By</div>
                                            <div style={{ fontWeight: 600 }}>{dispute.raisedBy?.name || 'Customer'}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{dispute.raisedBy?.email}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Date Opened</div>
                                            <div style={{ fontWeight: 600 }}>{new Date(dispute.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 style={{ color: '#ef4444', marginBottom: '4px' }}>Issue: {dispute.reason.replace(/_/g, ' ').toUpperCase()}</h4>
                                        <p style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', fontSize: '0.95rem' }}>
                                            "{dispute.description}"
                                        </p>
                                    </div>

                                    {dispute.evidencePhotos && dispute.evidencePhotos.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Evidence Provided</div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                {dispute.evidencePhotos.map((photo, i) => (
                                                    <a key={i} href={photo} target="_blank" rel="noreferrer">
                                                        <img src={photo} alt="evidence" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--neutral-200)' }} />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                        <button
                                            className="btn btn-outline"
                                            style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }}
                                            onClick={() => handleAction(dispute._id, 'refund_customer')}
                                            disabled={processingId === dispute._id}
                                        >
                                            {processingId === dispute._id ? 'Processing...' : 'Refund Escrow (Favor Customer)'}
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            style={{ flex: 1, background: '#22c55e', borderColor: '#22c55e' }}
                                            onClick={() => handleAction(dispute._id, 'release_tailor')}
                                            disabled={processingId === dispute._id}
                                        >
                                            {processingId === dispute._id ? 'Processing...' : 'Release Escrow (Favor Tailor)'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
