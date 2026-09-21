'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
    'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', ' तेलंगाना', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

function RegisterContent() {
    const { register } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultRole = searchParams.get('role') || 'customer';

    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: defaultRole, city: '', state: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const updateForm = (field, value) => setForm({ ...form, [field]: value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) {
            return setError('Passwords do not match');
        }
        if (form.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            const data = await register({
                name: form.name,
                email: form.email,
                phone: form.phone,
                password: form.password,
                role: form.role,
                location: { city: form.city, state: form.state },
            });
            if (data.user.role === 'tailor') router.push('/tailor/profile');
            else router.push('/');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '40px', maxWidth: '500px', width: '100%', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '6px' }}>Create Account</h1>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Join Vastra as a {form.role === 'tailor' ? 'Tailor' : 'Customer'}</p>
            </div>

            {/* Role toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'var(--neutral-100)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
                {['customer', 'tailor'].map((role) => (
                    <button type="button" key={role} onClick={() => updateForm('role', role)} style={{
                        flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                        background: form.role === role ? 'white' : 'transparent',
                        color: form.role === role ? 'var(--accent-600)' : 'var(--text-tertiary)',
                        boxShadow: form.role === role ? 'var(--shadow-sm)' : 'none',
                        transition: 'all var(--transition-fast)',
                    }}>
                        {role === 'customer' ? '👤 Customer' : '🧵 Tailor'}
                    </button>
                ))}
            </div>

            {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.88rem' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" className="form-input" value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder={form.role === 'tailor' ? 'Shop / Business Name' : 'Your full name'} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" className="form-input" value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="you@email.com" required />
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <input type="tel" className="form-input" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="9876543210" />
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                        <label>City</label>
                        <input type="text" className="form-input" value={form.city} onChange={(e) => updateForm('city', e.target.value)} placeholder="Mumbai" required />
                    </div>
                    <div className="form-group">
                        <label>State</label>
                        <select className="form-select" value={form.state} onChange={(e) => updateForm('state', e.target.value)} required>
                            <option value="">Select State</option>
                            {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label>Password</label>
                        <input type={showPassword ? 'text' : 'password'} className="form-input" value={form.password} onChange={(e) => updateForm('password', e.target.value)} placeholder="Min 6 chars" required style={{ paddingRight: '36px' }} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} title="Toggle visibility" style={{ position: 'absolute', right: '10px', top: '35px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                            {showPassword ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                            )}
                        </button>
                    </div>
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label>Confirm</label>
                        <input type={showConfirmPassword ? 'text' : 'password'} className="form-input" value={form.confirmPassword} onChange={(e) => updateForm('confirmPassword', e.target.value)} placeholder="Re-enter password" required style={{ paddingRight: '36px' }} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} title="Toggle visibility" style={{ position: 'absolute', right: '10px', top: '35px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                            {showConfirmPassword ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                            )}
                        </button>
                    </div>
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '8px' }}>
                    {loading ? 'Creating Account...' : `Sign Up as ${form.role === 'tailor' ? 'Tailor' : 'Customer'}`}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>
                Already have an account? <Link href="/login" style={{ color: 'var(--accent-600)', fontWeight: 600 }}>Log In</Link>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: '40px 20px' }}>
            <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>}>
                <RegisterContent />
            </Suspense>
        </div>
    );
}
