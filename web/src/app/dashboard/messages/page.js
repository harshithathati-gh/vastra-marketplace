'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function MessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/messages/conversations').then(d => setConversations(d.conversations || [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;

    return (
        <>
            <div className="page-header">
                <div className="container"><h1>Messages</h1><p>Your conversations with tailors</p></div>
            </div>
            <div className="container section" style={{ maxWidth: '720px', margin: '0 auto' }}>
                {conversations.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💬</div>
                        <h3>No messages yet</h3>
                        <p>Messages will appear here after you place an order</p>
                    </div>
                ) : conversations.map((conv) => (
                    <Link href={`/dashboard/orders/${conv.orderId}`} key={conv.orderId} className="card" style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', marginBottom: '10px', gap: '14px' }}>
                        <div className="navbar-avatar">
                            {(user?.role === 'customer' ? conv.order?.tailor?.name : conv.order?.customer?.name)?.charAt(0) || '?'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                                {user?.role === 'customer' ? conv.order?.tailor?.name : conv.order?.customer?.name}
                                <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', fontSize: '0.82rem', marginLeft: '8px' }}>
                                    {conv.order?.product?.name || conv.order?.product?.type}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                                {conv.lastMessage?.content || 'No messages'}
                            </div>
                        </div>
                        {conv.unreadCount > 0 && (
                            <span style={{ background: 'var(--accent-500)', color: 'white', borderRadius: 'var(--radius-full)', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700 }}>
                                {conv.unreadCount}
                            </span>
                        )}
                    </Link>
                ))}
            </div>
        </>
    );
}
