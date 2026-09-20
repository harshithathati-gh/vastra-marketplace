'use client';

export default function MeasurementGuidePage() {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '40px 20px', fontFamily: 'var(--font-sans)', color: '#111827' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ background: '#1e40af', color: 'white', padding: '40px', textAlign: 'center', position: 'relative' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 10px' }}>Vastra Measurement Guide</h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, margin: 0 }}>A complete step-by-step visual manual for the perfect fit.</p>
                    <button
                        onClick={handlePrint}
                        style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', color: '#1e40af', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        className="print-hide"
                    >
                        🖨️ Save as PDF
                    </button>
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @media print {
                            body { background: white !important; }
                            .print-hide { display: none !important; }
                            .page-break { page-break-before: always; }
                        }
                    `}} />
                </div>

                {/* General Tips */}
                <div style={{ padding: '40px' }}>
                    <h2 style={{ fontSize: '1.8rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '20px' }}>General Tips & Rules</h2>
                    <ul style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#4b5563', paddingLeft: '24px' }}>
                        <li><strong>Always use a flexible measuring tape.</strong> A soft cloth tape measure is best.</li>
                        <li><strong>Get a helping hand.</strong> Measurements are always more accurate when someone else takes them.</li>
                        <li><strong>Keep the tape parallel to the floor.</strong> Make sure it isn't twisted or sagging on your back.</li>
                        <li><strong>Don't pull too tight.</strong> The tape should be snug, but you should still be able to slip one finger underneath comfortably.</li>
                        <li><strong>Wear well-fitting undergarments.</strong> Avoid thick clothing; measure over bare skin or a thin base layer.</li>
                    </ul>
                </div>

                <div className="page-break" />

                {/* Core Measurements */}
                <div style={{ padding: '0 40px 40px' }}>
                    <h2 style={{ fontSize: '1.8rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '30px' }}>1. Upper Body Measurements</h2>

                    <div style={{ display: 'grid', gap: '40px' }}>

                        {/* Bust */}
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 300px' }}>
                                <img src="/images/measuring_bust_1789891394314.png" alt="Measuring Bust" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', height: '240px', border: '1px solid #e5e7eb' }} />
                            </div>
                            <div style={{ flex: '2 1 300px' }}>
                                <h3 style={{ fontSize: '1.4rem', margin: '0 0 10px', color: '#111827' }}>A. Bust (Women's Wear)</h3>
                                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#4b5563' }}>
                                    Wrap the tape around the fullest part of your bust. Ensure the tape is straight across your back, parallel to the floor. Do not hold your breath.
                                </p>
                            </div>
                        </div>

                        {/* Chest */}
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 300px' }}>
                                <img src="/images/measuring_chest_1789890528390.png" alt="Measuring Chest" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', height: '240px', border: '1px solid #e5e7eb' }} />
                                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '8px' }}>*Illustration representation for both chest & bust</div>
                            </div>
                            <div style={{ flex: '2 1 300px' }}>
                                <h3 style={{ fontSize: '1.4rem', margin: '0 0 10px', color: '#111827' }}>B. Chest (Men's Wear)</h3>
                                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#4b5563' }}>
                                    Wrap the measuring tape around the broadest part of your chest, typically right under the armpits. Keep your arms relaxed at your sides.
                                </p>
                            </div>
                        </div>

                        {/* Under Bust */}
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 300px' }}>
                                <img src="/images/measuring_under_bust_1789891173717.png" alt="Measuring Under Bust" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', height: '240px', border: '1px solid #e5e7eb' }} />
                            </div>
                            <div style={{ flex: '2 1 300px' }}>
                                <h3 style={{ fontSize: '1.4rem', margin: '0 0 10px', color: '#111827' }}>C. Under Bust</h3>
                                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#4b5563' }}>
                                    Measure horizontally directly beneath your bustline where your bra band typically sits. Keep the tape relatively snug but comfortable.
                                </p>
                            </div>
                        </div>

                        {/* Shoulder */}
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 300px' }}>
                                <img src="/images/measuring_shoulder_1789890540493.png" alt="Measuring Shoulder" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', height: '240px', border: '1px solid #e5e7eb' }} />
                            </div>
                            <div style={{ flex: '2 1 300px' }}>
                                <h3 style={{ fontSize: '1.4rem', margin: '0 0 10px', color: '#111827' }}>D. Shoulder Width</h3>
                                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#4b5563' }}>
                                    Measure your back from the edge of one shoulder (where the shoulder seam usually sits) across the top of your back to the edge of the other shoulder.
                                </p>
                            </div>
                        </div>

                        {/* Armhole */}
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 300px' }}>
                                <img src="/images/measuring_armhole_1789891187691.png" alt="Measuring Armhole" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', height: '240px', border: '1px solid #e5e7eb' }} />
                            </div>
                            <div style={{ flex: '2 1 300px' }}>
                                <h3 style={{ fontSize: '1.4rem', margin: '0 0 10px', color: '#111827' }}>E. Armhole Length / Circumference</h3>
                                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#4b5563' }}>
                                    Wrap the tape vertically around the shoulder joint, starting from the top of the shoulder edge, running down under the armpit, and back up to the top.
                                </p>
                            </div>
                        </div>

                        <div className="page-break" />

                        {/* Neck Depth */}
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 300px' }}>
                                <img src="/images/measuring_neck_depth_1789891216570.png" alt="Measuring Neck Depth" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', height: '240px', border: '1px solid #e5e7eb' }} />
                            </div>
                            <div style={{ flex: '2 1 300px' }}>
                                <h3 style={{ fontSize: '1.4rem', margin: '0 0 10px', color: '#111827' }}>F. Front / Back Neck Depth</h3>
                                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#4b5563' }}>
                                    <strong>Front Neck Depth:</strong> Start from the highest point of your shoulder (near the base of the neck) and measure diagonally down to the desired depth of your front neckline.<br /><br />
                                    <strong>Back Neck Depth:</strong> Perform the exact same measurement on your back to indicate how deep you want the back neck design.
                                </p>
                            </div>
                        </div>

                        {/* Sleeve */}
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 300px' }}>
                                <img src="/images/measuring_sleeve_1789890552791.png" alt="Measuring Sleeve" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', height: '240px', border: '1px solid #e5e7eb' }} />
                            </div>
                            <div style={{ flex: '2 1 300px' }}>
                                <h3 style={{ fontSize: '1.4rem', margin: '0 0 10px', color: '#111827' }}>G. Sleeve Length</h3>
                                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#4b5563' }}>
                                    Start from the edge of your shoulder line. Run the tape down the outside of your arm, past your elbow, down to your desired sleeve length (half, three-quarter, or full).
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="page-break" />

                {/* Lower Body Measurements */}
                <div style={{ padding: '0 40px 40px' }}>
                    <h2 style={{ fontSize: '1.8rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '30px' }}>2. Lower Body Variables</h2>

                    <div style={{ display: 'grid', gap: '40px' }}>

                        {/* Waist */}
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 300px' }}>
                                <img src="/images/measuring_waist_1789890567590.png" alt="Measuring Waist" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', height: '240px', border: '1px solid #e5e7eb' }} />
                            </div>
                            <div style={{ flex: '2 1 300px' }}>
                                <h3 style={{ fontSize: '1.4rem', margin: '0 0 10px', color: '#111827' }}>H. Waist</h3>
                                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#4b5563' }}>
                                    <strong>Natural Waist (Dresses, Lehengas):</strong> Measure around the narrowest part of your torso, usually just above your belly button.<br /><br />
                                    <strong>Trouser Waist:</strong> Measure around the circumference where your pants normally rest.
                                </p>
                            </div>
                        </div>

                        {/* Hips */}
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 300px' }}>
                                <img src="/images/measuring_hip_1789891203677.png" alt="Measuring Hip" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', height: '240px', border: '1px solid #e5e7eb' }} />
                            </div>
                            <div style={{ flex: '2 1 300px' }}>
                                <h3 style={{ fontSize: '1.4rem', margin: '0 0 10px', color: '#111827' }}>I. Hips</h3>
                                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#4b5563' }}>
                                    Stand with your feet close together. Wrap the measuring tape around the fullest part of your hips and buttocks, keeping it parallel to the floor. This is crucial for skirts, lehengas, and trousers.
                                </p>
                            </div>
                        </div>

                        {/* Inseam / Length */}
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 300px' }}>
                                <img src="/images/measuring_inseam_1789890579876.png" alt="Measuring Inseam" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', height: '240px', border: '1px solid #e5e7eb' }} />
                            </div>
                            <div style={{ flex: '2 1 300px' }}>
                                <h3 style={{ fontSize: '1.4rem', margin: '0 0 10px', color: '#111827' }}>J. Inseam / Outseam</h3>
                                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#4b5563' }}>
                                    <strong>Inseam:</strong> Measure from the crotch seam straight down the inside of your leg to the ankle (or desired trouser length).<br /><br />
                                    <strong>Outseam / Length:</strong> Measure from your waistline down the outside of your leg to your ankle (or desired length for lehengas).
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div style={{ background: '#f3f4f6', padding: '30px 40px', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
                    © {new Date().getFullYear()} Vastra Tailoring Marketplace. Designed for perfection. <br />
                    For more specific product measurements, consult with your tailor directly through the Vastra chat platform.
                </div>

            </div>
        </div>
    );
}
