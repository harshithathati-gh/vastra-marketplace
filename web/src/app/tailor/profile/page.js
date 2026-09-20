'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const SPEC_OPTIONS = [
    { value: 'men_ethnic', label: "Men's Ethnic" }, { value: 'men_western', label: "Men's Western" },
    { value: 'women_ethnic', label: "Women's Ethnic" }, { value: 'women_western', label: "Women's Western" },
    { value: 'kids', label: 'Kids' }, { value: 'bridal', label: 'Bridal' },
    { value: 'uniforms', label: 'Uniforms' }, { value: 'alterations', label: 'Alterations' },
    { value: 'embroidery', label: 'Embroidery' }, { value: 'designer', label: 'Designer' },
];

const PRICE_FIELDS = ['shirt', 'trousers', 'kurta', 'kurti', 'suit', 'lehenga', 'blouse', 'sherwani', 'saree_blouse', 'dress'];

export default function TailorProfileEditPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ bio: '', specializations: [], experience: 0, serviceArea: '', startingPrices: {} });

    useEffect(() => {
        if (!user || user.role !== 'tailor') { router.push('/login'); return; }
        api.get('/auth/me').then(d => {
            const tp = d.user?.tailorProfile;
            if (tp) {
                setProfile(tp);
                setForm({
                    bio: tp.bio || '', specializations: tp.specializations || [],
                    experience: tp.experience || 0, serviceArea: (tp.serviceArea || []).join(', '),
                    startingPrices: tp.startingPrices || {},
                });
            }
            setLoading(false);
        });
    }, []);

    const toggleSpec = (val) => {
        const specs = form.specializations.includes(val) ? form.specializations.filter(s => s !== val) : [...form.specializations, val];
        setForm({ ...form, specializations: specs });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/tailors/profile', {
                bio: form.bio,
                specializations: form.specializations,
                experience: parseInt(form.experience),
                serviceArea: form.serviceArea.split(',').map(s => s.trim()).filter(Boolean),
                startingPrices: form.startingPrices,
            });
            alert('Profile updated!');
        } catch (err) { alert(err.message); }
        setSaving(false);
    };

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;

    return (
        <>
            <div className="page-header">
                <div className="container"><h1>Edit Profile</h1><p>Update your professional information and portfolio</p></div>
            </div>

            <div className="container section" style={{ maxWidth: '720px', margin: '0 auto' }}>
                {profile?.verificationStatus === 'pending' && (
                    <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: '24px', fontSize: '0.9rem' }}>
                        ⏳ Your profile is <strong>pending verification</strong>. You can still update your information while we review your application.
                    </div>
                )}

                <div className="card" style={{ marginBottom: '24px' }}>
                    <div className="card-body">
                        <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>About You</h3>
                        <div className="form-group">
                            <label>Bio</label>
                            <textarea className="form-textarea" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell customers about your experience, specialties, and what makes your work special..." rows={4} />
                        </div>
                        <div className="form-group">
                            <label>Years of Experience</label>
                            <input type="number" className="form-input" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} min="0" max="60" style={{ maxWidth: '120px' }} />
                        </div>
                        <div className="form-group">
                            <label>Service Areas (comma separated)</label>
                            <input type="text" className="form-input" value={form.serviceArea} onChange={(e) => setForm({ ...form, serviceArea: e.target.value })} placeholder="Mumbai, Thane, Pan India" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: '24px' }}>
                    <div className="card-body">
                        <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Specializations</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {SPEC_OPTIONS.map(opt => (
                                <button key={opt.value} onClick={() => toggleSpec(opt.value)} className={`badge ${form.specializations.includes(opt.value) ? 'badge-accent' : ''}`} style={{
                                    cursor: 'pointer', padding: '8px 14px', fontSize: '0.85rem', border: '1px solid var(--neutral-200)',
                                    background: form.specializations.includes(opt.value) ? 'var(--accent-100)' : 'white',
                                    color: form.specializations.includes(opt.value) ? 'var(--accent-800)' : 'var(--text-secondary)',
                                }}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: '24px' }}>
                    <div className="card-body">
                        <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Starting Prices (₹)</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                            {PRICE_FIELDS.map(field => (
                                <div key={field} className="form-group">
                                    <label style={{ textTransform: 'capitalize' }}>{field.replace(/_/g, ' ')}</label>
                                    <input type="number" className="form-input" value={form.startingPrices[field] || ''} onChange={(e) => setForm({ ...form, startingPrices: { ...form.startingPrices, [field]: parseInt(e.target.value) || 0 } })} placeholder="0" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button className="btn btn-primary btn-lg btn-full" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>
            </div>
        </>
    );
}
