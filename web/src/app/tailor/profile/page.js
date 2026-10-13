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
    const [form, setForm] = useState({
        bio: '',
        specializations: [],
        experience: 0,
        serviceArea: '',
        startingPrices: {},
        upiId: '',
        workshopAddress: '',
        aadhaarOrPan: '',
        bankAccount: { accountNumber: '', ifscCode: '', accountHolderName: '' }
    });

    useEffect(() => {
        if (!user || user.role !== 'tailor') { router.push('/login'); return; }
        api.get('/auth/me').then(d => {
            const tp = d.user?.tailorProfile;
            if (tp) {
                setProfile(tp);
                setForm({
                    bio: tp.bio || '',
                    specializations: tp.specializations || [],
                    experience: tp.experience || 0,
                    serviceArea: (tp.serviceArea || []).join(', '),
                    startingPrices: tp.startingPrices || {},
                    upiId: tp.upiId || '',
                    workshopAddress: tp.workshopAddress || '',
                    aadhaarOrPan: tp.aadhaarOrPan || '',
                    bankAccount: tp.bankAccount || { accountNumber: '', ifscCode: '', accountHolderName: '' }
                });
            }
            setLoading(false);
        });
    }, []);

    const toggleSpec = (val) => {
        const specs = form.specializations.includes(val) 
            ? form.specializations.filter(s => s !== val) 
            : [...form.specializations, val];
        setForm({ ...form, specializations: specs });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/tailors/profile', {
                bio: form.bio,
                specializations: form.specializations,
                experience: parseInt(form.experience) || 0,
                serviceArea: form.serviceArea.split(',').map(s => s.trim()).filter(Boolean),
                startingPrices: form.startingPrices,
                upiId: form.upiId,
                workshopAddress: form.workshopAddress,
                aadhaarOrPan: form.aadhaarOrPan,
                bankAccount: form.bankAccount,
            });
            alert('Tailor profile & payout settings updated successfully!');
        } catch (err) {
            alert(err.message);
        }
        setSaving(false);
    };

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;

    return (
        <>
            <div className="page-header">
                <div className="container">
                    <h1>Artisan Profile & Verification</h1>
                    <p>Manage your tailoring credentials, workshop logistics, and UPI payout details</p>
                </div>
            </div>

            <div className="container section" style={{ maxWidth: '760px', margin: '0 auto' }}>
                {profile?.verificationStatus === 'approved' ? (
                    <div style={{ background: '#ECFDF5', border: '1px solid #10B981', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: '24px', fontSize: '0.9rem', color: '#065F46' }}>
                        ✅ <strong>Verified Vastra Artisan</strong>. Your profile is live and receiving custom stitching orders across India.
                    </div>
                ) : profile?.verificationStatus === 'pending' ? (
                    <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: '24px', fontSize: '0.9rem', color: '#92400E' }}>
                        ⏳ <strong>Verification Pending</strong>: Complete your workshop address, UPI ID, and experience details below to get verified by our onboarding team.
                    </div>
                ) : (
                    <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: '24px', fontSize: '0.9rem', color: '#991B1B' }}>
                        ❌ <strong>Verification Incomplete</strong>: Please update your workshop address and KYC information.
                    </div>
                )}

                {/* About the Artisan */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <div className="card-body">
                        <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>🧵 Artisan Details</h3>
                        <div className="form-group">
                            <label>Professional Bio</label>
                            <textarea className="form-textarea" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell customers about your craftsmanship, years of experience, hand-embroidery skills, and fitting guarantees..." rows={4} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                            <div className="form-group">
                                <label>Years of Experience</label>
                                <input type="number" className="form-input" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} min="0" max="60" />
                            </div>
                            <div className="form-group">
                                <label>Service Areas (comma-separated)</label>
                                <input type="text" className="form-input" value={form.serviceArea} onChange={(e) => setForm({ ...form, serviceArea: e.target.value })} placeholder="Mumbai, Pune, Pan India" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payout & Banking Details (UPI, GPay, BHIM) */}
                <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid #6D28D9' }}>
                    <div className="card-body">
                        <h3 style={{ fontWeight: 700, marginBottom: '6px', color: '#6D28D9' }}>💰 Earnings & Payout Settings</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
                            Where Vastra automatically disburses your tailoring fees once orders are completed.
                        </p>
                        
                        <div className="form-group">
                            <label>Primary UPI ID (Google Pay, BHIM, PhonePe)</label>
                            <input
                                type="text"
                                className="form-input"
                                value={form.upiId}
                                onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                                placeholder="e.g. mastertailor@okhdfcbank or 9876543210@upi"
                            />
                            <small style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>Direct 0% deduction UPI payouts on order delivery</small>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label>Bank Account Number</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.bankAccount?.accountNumber || ''}
                                    onChange={(e) => setForm({ ...form, bankAccount: { ...form.bankAccount, accountNumber: e.target.value } })}
                                    placeholder="Account Number"
                                />
                            </div>
                            <div className="form-group">
                                <label>IFSC Code</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.bankAccount?.ifscCode || ''}
                                    onChange={(e) => setForm({ ...form, bankAccount: { ...form.bankAccount, ifscCode: e.target.value.toUpperCase() } })}
                                    placeholder="e.g. HDFC0001234"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Workshop Logistics & KYC Verification */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <div className="card-body">
                        <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>📍 Workshop Logistics & KYC</h3>
                        <div className="form-group">
                            <label>Physical Workshop / Boutique Address</label>
                            <textarea
                                className="form-textarea"
                                value={form.workshopAddress}
                                onChange={(e) => setForm({ ...form, workshopAddress: e.target.value })}
                                placeholder="Shop #, Building, Street, Area, City, Pincode (Used by courier partners for customer fabric delivery and garment pickups)"
                                rows={2}
                            />
                        </div>
                        <div className="form-group">
                            <label>Aadhaar / PAN / GST Number (for KYC verification)</label>
                            <input
                                type="text"
                                className="form-input"
                                value={form.aadhaarOrPan}
                                onChange={(e) => setForm({ ...form, aadhaarOrPan: e.target.value })}
                                placeholder="e.g. ABCDE1234F"
                            />
                        </div>
                    </div>
                </div>

                {/* Specializations */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <div className="card-body">
                        <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Garment Specializations</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {SPEC_OPTIONS.map(opt => (
                                <button key={opt.value} type="button" onClick={() => toggleSpec(opt.value)} className={`badge ${form.specializations.includes(opt.value) ? 'badge-accent' : ''}`} style={{
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

                {/* Starting Prices */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <div className="card-body">
                        <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Starting Stitching Rates (₹)</h3>
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

                <button className="btn btn-primary btn-lg btn-full" onClick={handleSave} disabled={saving} style={{ background: '#6D28D9' }}>
                    {saving ? 'Saving...' : 'Save Profile & Payout Details'}
                </button>
            </div>
        </>
    );
}
