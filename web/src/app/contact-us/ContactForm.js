'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function ContactForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState(''); // 'sending', 'success', 'error'

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await api.post('/contact', { name, email, message });
            setStatus('success');
            setName(''); setEmail(''); setMessage('');
        } catch (error) {
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div style={{ padding: '20px', background: 'var(--success-50)', color: 'var(--success-700)', borderRadius: 'var(--radius-md)', border: '1px solid var(--success)' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>Message Sent!</h4>
                <p style={{ margin: 0 }}>Thank you for reaching out. The Vastra Support team will review your message and reply via email shortly.</p>
                <button onClick={() => setStatus('')} className="btn btn-outline btn-sm" style={{ marginTop: '15px' }}>Send another message</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {status === 'error' && (
                <div style={{ padding: '10px', background: '#FEE2E2', color: '#991B1B', borderRadius: 'var(--radius-sm)' }}>
                    Failed to send message. Please try again.
                </div>
            )}
            <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: 600 }}>Your Name</label>
                <input type="text" className="form-input" required placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: 600 }}>Email Address</label>
                <input type="email" className="form-input" required placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: 600 }}>Message</label>
                <textarea className="form-textarea" required rows="4" placeholder="How can we help you today?" value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
        </form>
    );
}
