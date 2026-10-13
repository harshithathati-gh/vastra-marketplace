'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

function LoginContent() {
    const { login, checkAuth } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Mode: 'login' or 'forgot'
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Forgot password state
    const [forgotStep, setForgotStep] = useState(1); // 1: enter email, 2: enter otp & new pass
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);
        try {
            const data = await login(email, password);
            if (data.user.role === 'admin') router.push('/admin');
            else if (data.user.role === 'tailor') router.push('/tailor/dashboard');
            else router.push(searchParams.get('redirect') || '/');
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        if (!email) return setError('Please enter your registered email address.');
        setLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setSuccessMsg(res.message || 'OTP sent to your email! Please check your inbox.');
            setForgotStep(2);
        } catch (err) {
            setError(err.message || 'Could not send OTP. Please check your email.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        if (!otp || otp.length < 6) return setError('Please enter the 6-digit OTP.');
        if (!newPassword || newPassword.length < 6) return setError('Password must be at least 6 characters.');
        setLoading(true);
        try {
            const res = await api.post('/auth/reset-password', { email, otp, newPassword });
            if (res.token) {
                localStorage.setItem('vastra_token', res.token);
                await checkAuth();
                setSuccessMsg('Password reset successfully! Logging you in...');
                setTimeout(() => {
                    router.push('/');
                }, 1000);
            } else {
                setSuccessMsg('Password updated. Please log in.');
                setMode('login');
                setForgotStep(1);
            }
        } catch (err) {
            setError(err.message || 'Invalid or expired OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '40px', maxWidth: '440px', width: '100%', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '6px' }}>
                    {mode === 'login' ? 'Welcome Back' : 'Reset Password'}
                </h1>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                    {mode === 'login' ? 'Log in to your Vastra account' : 'Verify via email OTP to set a new password'}
                </p>
            </div>

            {error && (
                <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '18px', fontSize: '0.88rem' }}>
                    {error}
                </div>
            )}

            {successMsg && (
                <div style={{ background: '#ECFDF5', color: '#065F46', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '18px', fontSize: '0.88rem' }}>
                    {successMsg}
                </div>
            )}

            {mode === 'login' ? (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                    </div>
                    <div className="form-group" style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ margin: 0 }}>Password</label>
                            <button
                                type="button"
                                onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                                style={{ background: 'none', border: 'none', color: 'var(--accent-600)', fontSize: '0.82rem', cursor: 'pointer', padding: 0 }}
                            >
                                Forgot password?
                            </button>
                        </div>
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
            ) : (
                <div>
                    {forgotStep === 1 ? (
                        <form onSubmit={handleSendOtp}>
                            <div className="form-group">
                                <label>Registered Email</label>
                                <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                            </div>
                            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '8px' }}>
                                {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword}>
                            <div className="form-group">
                                <label>Enter 6-Digit OTP</label>
                                <input type="text" maxLength={6} className="form-input" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" required style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }} />
                            </div>
                            <div className="form-group">
                                <label>New Password (min 6 characters)</label>
                                <input type="password" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required />
                            </div>
                            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '8px' }}>
                                {loading ? 'Resetting...' : 'Reset & Log In'}
                            </button>
                        </form>
                    )}
                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <button
                            type="button"
                            onClick={() => { setMode('login'); setForgotStep(1); setError(''); setSuccessMsg(''); }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                            ← Back to Log In
                        </button>
                    </div>
                </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>
                Don't have an account? <Link href="/register" style={{ color: 'var(--accent-600)', fontWeight: 600 }}>Sign Up</Link>
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
