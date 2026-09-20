'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
    'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultRole = searchParams.get('role') || 'customer';

    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: defaultRole, city: '', state: '' });
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
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: '40px 20px' }}>
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '40px', maxWidth: '500px', width: '100%', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '6px' }}>Create Account</h1>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Join Vastra as a {form.role === 'tailor' ? 'Tailor' : 'Customer'}</p>
                </div>

                {/* Role toggle */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'var(--neutral-100)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
                    {['customer', 'tailor'].map((role) => (
                        <button key={role} onClick={() => updateForm('role', role)} style={{
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
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" className="form-input" value={form.password} onChange={(e) => updateForm('password', e.target.value)} placeholder="Min 6 characters" required />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input type="password" className="form-input" value={form.confirmPassword} onChange={(e) => updateForm('confirmPassword', e.target.value)} placeholder="Re-enter password" required />
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
        </div>
    );
}
