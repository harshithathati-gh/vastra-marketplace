'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const INDIAN_STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

function NewOrderContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const tailorId = searchParams.get('tailor');

    const [step, setStep] = useState(1);
    const [tailor, setTailor] = useState(null);
    const [products, setProducts] = useState([]);
    const [measurementProfiles, setMeasurementProfiles] = useState([]);
    const [measurementTemplate, setMeasurementTemplate] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        productId: '', productType: '', productName: '', designChoices: {},
        measurementProfileName: '', measurements: {},
        fabricPreference: 'tailor_provided', garmentBrand: '', specialInstructions: '',
        street: '', city: user?.location?.city || '', state: user?.location?.state || '', pincode: '',
        deliveryType: 'shipping', preferredDeliveryDate: '',
    });

    useEffect(() => {
        if (!user) { router.push('/login?redirect=/order/new'); return; }
        Promise.all([
            tailorId ? api.get(`/tailors/${tailorId}`).then(d => setTailor(d.tailor)) : Promise.resolve(),
            api.get('/products?limit=50').then(d => setProducts(d.products || [])),
            api.get('/measurements').then(d => setMeasurementProfiles(d.profiles || [])).catch(() => { }),
        ]);
    }, []);

    const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const selectProduct = async (product) => {
        setForm(prev => ({ ...prev, productId: product._id, productType: product.type, productName: product.name, designChoices: {} }));
        try {
            const data = await api.get(`/measurements/templates/${product.type}`);
            setMeasurementTemplate(data.template);
        } catch { setMeasurementTemplate(null); }
    };

    const handleSubmit = async () => {
        setError('');
        setLoading(true);
        try {
            const orderData = {
                tailorId,
                product: { type: form.productType, name: form.productName, designChoices: form.designChoices, referenceImages: [] },
                measurements: form.measurements,
                measurementProfileName: form.measurementProfileName,
                fabricPreference: form.fabricPreference,
                specialInstructions: form.garmentBrand ? `[Preferred Brand: ${form.garmentBrand}]\n${form.specialInstructions}` : form.specialInstructions,
                deliveryAddress: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
                deliveryType: form.deliveryType,
                preferredDeliveryDate: form.preferredDeliveryDate || undefined,
            };
            const data = await api.post('/orders', orderData);
            router.push(`/dashboard/orders/${data.order._id}`);
        } catch (err) {
            setError(err.message || 'Failed to place order');
        }
        setLoading(false);
    };

    if (!user) return null;

    const selectedProduct = products.find(p => p._id === form.productId);

    return (
        <>
            <div className="page-header">
                <div className="container">
                    <h1>Place Your Order</h1>
                    <p>{tailor ? `Ordering from ${tailor.userId?.name}` : 'Custom tailoring order'}</p>
                </div>
            </div>

            <div className="container section" style={{ maxWidth: '720px', margin: '0 auto' }}>
                {/* Progress Steps */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '36px' }}>
                    {['Product', 'Measurements', 'Details', 'Confirm'].map((label, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.82rem', fontWeight: 700,
                                background: step > i + 1 ? 'var(--success)' : step === i + 1 ? 'var(--accent-500)' : 'var(--neutral-200)',
                                color: step >= i + 1 ? 'white' : 'var(--text-tertiary)',
                            }}>{step > i + 1 ? '✓' : i + 1}</div>
                            <span style={{ fontSize: '0.82rem', fontWeight: step === i + 1 ? 700 : 400, color: step === i + 1 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{label}</span>
                            {i < 3 && <div style={{ width: 24, height: 2, background: step > i + 1 ? 'var(--success)' : 'var(--neutral-200)' }} />}
                        </div>
                    ))}
                </div>

                {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.88rem' }}>{error}</div>}

                {/* Step 1: Select Product */}
                {step === 1 && (
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>What would you like to get tailored?</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                            {products.map(p => (
                                <div key={p._id} onClick={() => selectProduct(p)} style={{
                                    padding: '16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'center',
                                    border: form.productId === p._id ? '2px solid var(--accent-500)' : '1px solid var(--neutral-200)',
                                    background: form.productId === p._id ? 'var(--accent-50)' : 'white',
                                    transition: 'all var(--transition-fast)',
                                }}>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{p.category} • {p.subCategory}</div>
                                    <div style={{ fontWeight: 700, marginTop: '4px' }}>{p.name}</div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--primary-700)', marginTop: '4px' }}>₹{p.priceRange?.min}+</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                            <button className="btn btn-primary" disabled={!form.productId} onClick={() => setStep(2)}>Next →</button>
                        </div>
                    </div>
                )}

                {/* Step 2: Measurements */}
                {step === 2 && (
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Your Measurements</h2>

                        <div style={{ background: '#EFF6FF', color: '#1E40AF', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                <span>💡</span>
                                <div>
                                    <strong>Important:</strong> For the most accurate fit, we highly recommend taking a helping hand from a friend or family member while measuring, rather than doing it yourself.
                                </div>
                            </div>
                            <div style={{ marginLeft: '22px' }}>
                                <a href="/measurements-guide" target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', textDecoration: 'underline', fontWeight: 600 }}>
                                    📄 Print / View Vastra Measurement Guide (PDF)
                                </a>
                            </div>
                        </div>

                        {measurementProfiles.length > 0 && (
                            <div className="form-group">
                                <label>Use a saved profile</label>
                                <select className="form-select" value={form.measurementProfileName} onChange={(e) => {
                                    const profile = measurementProfiles.find(p => p.profileName === e.target.value);
                                    if (profile) {
                                        const measurements = {};
                                        profile.measurements.forEach((v, k) => { measurements[k] = v; });
                                        setForm({ ...form, measurementProfileName: e.target.value, measurements });
                                    } else {
                                        updateForm('measurementProfileName', '');
                                    }
                                }}>
                                    <option value="">Enter manually</option>
                                    {measurementProfiles.map(p => <option key={p._id} value={p.profileName}>{p.profileName}</option>)}
                                </select>
                            </div>
                        )}

                        {measurementTemplate ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {measurementTemplate.fields.map(field => (
                                    <div key={field.name} className="form-group">
                                        <label>{field.label} ({field.unit}){field.required ? ' *' : ''}</label>
                                        <input type="number" className="form-input" step="0.5" value={form.measurements[field.name] || ''} onChange={(e) => setForm({ ...form, measurements: { ...form.measurements, [field.name]: parseFloat(e.target.value) } })} placeholder={field.helpText} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>No measurement template available for this product. Enter your measurements in the notes.</p>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                            <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                            <button className="btn btn-primary" onClick={() => setStep(3)}>Next →</button>
                        </div>
                    </div>
                )}

                {/* Step 3: Details */}
                {step === 3 && (
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Order Details</h2>

                        {selectedProduct?.designOptions && Object.entries(selectedProduct.designOptions).map(([key, values]) => {
                            if (!values || values.length === 0) return null;
                            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                            return (
                                <div key={key} className="form-group">
                                    <label>{label}</label>
                                    <select className="form-select" value={form.designChoices[key] || ''} onChange={(e) => setForm({ ...form, designChoices: { ...form.designChoices, [key]: e.target.value } })}>
                                        <option value="">Select {label}</option>
                                        {values.map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                            );
                        })}

                        <div className="form-group">
                            <label>Fabric Preference</label>
                            <select className="form-select" value={form.fabricPreference} onChange={(e) => updateForm('fabricPreference', e.target.value)}>
                                <option value="tailor_provided">Tailor will provide fabric</option>
                                <option value="self_provided">I will provide my own fabric</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Preferred Fabric Brand</label>
                            <select className="form-select" value={form.garmentBrand} onChange={(e) => updateForm('garmentBrand', e.target.value)}>
                                <option value="">No Preference / Tailor's Choice</option>
                                <optgroup label="Budget & Affordable Brands">
                                    <option value="Siyaram's">Siyaram's</option>
                                    <option value="Vimal">Vimal</option>
                                </optgroup>
                                <optgroup label="Mid-Range & Premium Brands">
                                    <option value="Arvind Limited">Arvind Limited</option>
                                    <option value="Linen Club">Linen Club</option>
                                    <option value="Cottonworld">Cottonworld</option>
                                </optgroup>
                                <optgroup label="Luxury & High-End Brands">
                                    <option value="Raymond">Raymond</option>
                                    <option value="Morarjee">Morarjee</option>
                                </optgroup>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Special Instructions</label>
                            <textarea className="form-textarea" value={form.specialInstructions} onChange={(e) => updateForm('specialInstructions', e.target.value)} placeholder="Any specific requirements, design references, or notes for the tailor..." />
                        </div>

                        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '24px 0 12px' }}>Delivery Details</h3>

                        <div className="form-group">
                            <label>Delivery Type</label>
                            <select className="form-select" value={form.deliveryType} onChange={(e) => updateForm('deliveryType', e.target.value)}>
                                <option value="shipping">Ship to my address</option>
                                <option value="self_pickup">I'll pick up from the tailor</option>
                            </select>
                        </div>

                        {form.deliveryType === 'shipping' && (
                            <>
                                <div className="form-group">
                                    <label>Street Address</label>
                                    <input type="text" className="form-input" value={form.street} onChange={(e) => updateForm('street', e.target.value)} placeholder="House no, street, area" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input type="text" className="form-input" value={form.city} onChange={(e) => updateForm('city', e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label>State</label>
                                        <select className="form-select" value={form.state} onChange={(e) => updateForm('state', e.target.value)} required>
                                            <option value="">Select</option>
                                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Pincode</label>
                                        <input type="text" className="form-input" value={form.pincode} onChange={(e) => updateForm('pincode', e.target.value)} placeholder="400001" required />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label>Preferred Delivery Date (optional)</label>
                            <input type="date" className="form-input" value={form.preferredDeliveryDate} onChange={(e) => updateForm('preferredDeliveryDate', e.target.value)} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                            <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                            <button className="btn btn-primary" onClick={() => setStep(4)}>Review Order →</button>
                        </div>
                    </div>
                )}

                {/* Step 4: Confirm */}
                {step === 4 && (
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Confirm Your Order</h2>

                        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '20px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Product</div>
                                <div style={{ fontWeight: 700 }}>{form.productName}</div>
                            </div>
                            {tailor && (
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Tailor</div>
                                    <div style={{ fontWeight: 700 }}>{tailor.userId?.name} — {tailor.userId?.location?.city}</div>
                                </div>
                            )}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Delivery</div>
                                <div style={{ fontWeight: 600 }}>{form.deliveryType === 'shipping' ? `${form.street}, ${form.city}, ${form.state} ${form.pincode}` : 'Self Pickup'}</div>
                            </div>
                            {Object.keys(form.designChoices).length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Design Options</div>
                                    {Object.entries(form.designChoices).filter(([, v]) => v).map(([k, v]) => (
                                        <span key={k} className="badge badge-accent" style={{ marginRight: '6px', marginTop: '4px' }}>{k}: {v}</span>
                                    ))}
                                </div>
                            )}
                            {form.garmentBrand && (
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Brand Preference</div>
                                    <div style={{ fontWeight: 600, color: 'var(--primary-700)' }}>{form.garmentBrand}</div>
                                </div>
                            )}
                            {form.specialInstructions && (
                                <div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Special Instructions</div>
                                    <div style={{ fontSize: '0.9rem' }}>{form.specialInstructions}</div>
                                </div>
                            )}
                        </div>

                        <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)', marginBottom: '20px' }}>
                            💡 After placing the order, the tailor will review your requirements and send you a price quote. Payment is collected only after you approve the quote.
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button className="btn btn-outline" onClick={() => setStep(3)}>← Back</button>
                            <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Placing Order...' : '✅ Place Order'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default function NewOrderPage() {
    return (
        <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>}>
            <NewOrderContent />
        </Suspense>
    );
}
