'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function MeasurementsPage() {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ profileName: '', garmentType: 'general', measurements: {} });
    const [garmentTemplate, setGarmentTemplate] = useState(null);

    useEffect(() => {
        api.get('/measurements').then(d => setProfiles(d.profiles || [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const loadTemplate = async (type) => {
        setForm(prev => ({ ...prev, garmentType: type }));
        try {
            const data = await api.get(`/measurements/templates/${type}`);
            setGarmentTemplate(data.template);
        } catch { setGarmentTemplate(null); }
    };

    const handleOpenForm = () => {
        setShowForm(true);
        loadTemplate('general');
    };

    const saveProfile = async () => {
        try {
            await api.post('/measurements', form);
            const data = await api.get('/measurements');
            setProfiles(data.profiles || []);
            setShowForm(false);
            setForm({ profileName: '', garmentType: 'general', measurements: {} });
        } catch (err) { alert(err.message); }
    };

    const deleteProfile = async (id) => {
        if (!confirm('Delete this profile?')) return;
        try {
            await api.delete(`/measurements/${id}`);
            setProfiles(profiles.filter(p => p._id !== id));
        } catch { }
    };

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;

    return (
        <>
            <div className="page-header">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><h1>My Measurements</h1><p>Save measurement profiles for quick ordering</p></div>
                    <button className="btn btn-primary" onClick={handleOpenForm}>+ New Profile</button>
                </div>
            </div>

            <div className="container section">
                {showForm && (
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <div className="card-body">
                            <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>New Measurement Profile</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                                <div className="form-group">
                                    <label>Profile Name</label>
                                    <input type="text" className="form-input" value={form.profileName} onChange={(e) => setForm({ ...form, profileName: e.target.value })} placeholder='e.g. "Self", "Mom", "Wife"' />
                                </div>
                                <div className="form-group">
                                    <label>Garment Type</label>
                                    <select className="form-select" value={form.garmentType} onChange={(e) => loadTemplate(e.target.value)}>
                                        <option value="general">General</option>
                                        <option value="shirt">Shirt</option>
                                        <option value="trousers">Trousers</option>
                                        <option value="kurta">Kurta</option>
                                        <option value="blouse">Blouse</option>
                                        <option value="lehenga">Lehenga</option>
                                        <option value="salwar_suit">Salwar Suit</option>
                                        <option value="anarkali">Anarkali</option>
                                        <option value="kurti">Kurti</option>
                                        <option value="suit">Suit / Blazer</option>
                                    </select>
                                </div>
                            </div>

                            {garmentTemplate && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '12px', marginTop: '12px' }}>
                                    {garmentTemplate.fields.map(field => (
                                        <div key={field.name} className="form-group" style={{ marginBottom: '10px' }}>
                                            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>{field.label} ({field.unit})</label>
                                            <input type="number" className="form-input" step="0.5" value={form.measurements[field.name] || ''} onChange={(e) => setForm({ ...form, measurements: { ...form.measurements, [field.name]: parseFloat(e.target.value) } })} placeholder={field.helpText} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                                <button className="btn btn-primary" onClick={saveProfile}>Save Profile</button>
                                <button className="btn btn-outline" onClick={() => { setShowForm(false); setGarmentTemplate(null); }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {profiles.length === 0 && !showForm ? (
                    <div className="empty-state">
                        <div className="empty-icon">📏</div>
                        <h3>No saved measurements</h3>
                        <p>Save your measurements to speed up the ordering process</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {profiles.map((profile) => (
                            <div key={profile._id} className="card">
                                <div className="card-body">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <div>
                                            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{profile.profileName}</h3>
                                            <span className="badge badge-accent">{profile.garmentType}</span>
                                        </div>
                                        <button onClick={() => deleteProfile(profile._id)} style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: '0.82rem', cursor: 'pointer' }}>Delete</button>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.85rem' }}>
                                        {profile.measurements && Object.entries(
                                            typeof profile.measurements.entries === 'function'
                                                ? Object.fromEntries(profile.measurements)
                                                : profile.measurements
                                        ).map(([key, val]) => (
                                            <div key={key}>
                                                <span style={{ color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}: </span>
                                                <strong>{val}"</strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
