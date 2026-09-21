'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginContent() {
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(email, password);
            if (data.user.role === 'admin') router.push('/admin');
            else if (data.user.role === 'tailor') router.push('/tailor/dashboard');
            else router.push(searchParams.get('redirect') || '/');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '40px', maxWidth: '440px', width: '100%', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '6px' }}>Welcome Back</h1>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Log in to your Vastra account</p>
            </div>

            {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.88rem' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                    <label>Password</label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        style={{ paddingRight: '40px' }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? "Hide password" : "Show password"}
                        style={{
                            position: 'absolute', right: '12px', top: '34px',
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-tertiary)'
                        }}
                    >
                        {showPassword ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                    </button>
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '8px' }}>
                    {loading ? 'Logging in...' : 'Log In'}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>
                Don't have an account? <Link href="/register" style={{ color: 'var(--accent-600)', fontWeight: 600 }}>Sign Up</Link>
            </div>

            {/* Quick login for demo */}
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--neutral-200)' }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: '10px' }}>Demo Accounts (click to auto-fill)</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {[
                        { label: '👤 Customer', email: 'priya@example.com', pass: 'password123' },
                        { label: '🧵 Tailor', email: 'rajesh@example.com', pass: 'password123' },
                    ].map((demo) => (
                        <button key={demo.email} onClick={(e) => { e.preventDefault(); setEmail(demo.email); setPassword(demo.pass); }} className="btn btn-outline btn-sm" style={{ fontSize: '0.78rem' }}>
                            {demo.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: '40px 20px' }}>
            <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>}>
                <LoginContent />
            </Suspense>
        </div>
    );
}
