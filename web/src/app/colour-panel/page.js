'use client';

import { useState, useRef, useEffect } from 'react';

export default function ColourPanelPage() {
    const [hue, setHue] = useState(0);
    const [vibe, setVibe] = useState('vivid');
    const [isDragging, setIsDragging] = useState(false);
    const wheelRef = useRef(null);

    // Get saturation and lightness based on selected vibe
    let s = 100;
    let l = 50;

    if (vibe === 'pastel') { s = 80; l = 80; }
    else if (vibe === 'matte') { s = 40; l = 55; }
    else if (vibe === 'deep') { s = 80; l = 25; }

    // Helper to generate HSL string
    const getHSL = (h) => `hsl(${h}, ${s}%, ${l}%)`;

    // Mathematical harmonies based on hue
    const baseColor = getHSL(hue);
    const complementary = getHSL((hue + 180) % 360);
    const analogous1 = getHSL((hue + 30) % 360);
    const analogous2 = getHSL((hue - 30 + 360) % 360);
    const triadic1 = getHSL((hue + 120) % 360);
    const triadic2 = getHSL((hue + 240) % 360);

    const handleInteract = (e) => {
        if (!wheelRef.current) return;
        const rect = wheelRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - centerX;
        const dy = clientY - centerY;

        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        angle = angle + 90;
        if (angle < 0) angle += 360;

        setHue(Math.round(angle));
    };

    useEffect(() => {
        const handleMouseUp = () => setIsDragging(false);
        const handleMouseMove = (e) => {
            if (isDragging) handleInteract(e);
        };
        const handleTouchMove = (e) => {
            if (isDragging) {
                e.preventDefault();
                handleInteract(e);
            }
        };

        if (isDragging) {
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('touchend', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
        }

        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, [isDragging]);

    return (
        <div className="container section" style={{ minHeight: '85vh' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Colour Matcher</h1>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '40px' }}>
                Drag the pointer around the wheel to discover beautiful matching shades for your perfect outfit.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '40px', alignItems: 'start' }}>

                {/* Left Side: The Interactive Wheel */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
                    <h3 style={{ marginBottom: '30px' }}>Pick a Color Family</h3>

                    <div
                        ref={wheelRef}
                        onMouseDown={(e) => { setIsDragging(true); handleInteract(e); }}
                        onTouchStart={(e) => { setIsDragging(true); handleInteract(e); }}
                        style={{
                            width: '280px',
                            height: '280px',
                            borderRadius: '50%',
                            background: 'conic-gradient(from 0deg, red, #ff0, lime, cyan, blue, #f0f, red)',
                            position: 'relative',
                            cursor: 'crosshair',
                            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1), 0 10px 25px rgba(0,0,0,0.1)'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '180px', height: '180px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.1)'
                        }}></div>

                        <div style={{
                            position: 'absolute',
                            top: '50%', left: '50%',
                            width: '100%', height: '100%',
                            transform: `translate(-50%, -50%) rotate(${hue}deg)`,
                            pointerEvents: 'none'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '-10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '20px',
                                height: '20px',
                                backgroundColor: baseColor,
                                border: '3px solid white',
                                borderRadius: '50%',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                            }}></div>
                        </div>
                    </div>

                    <div style={{ width: '100%', marginTop: '40px' }}>
                        <h4 style={{ marginBottom: '15px', textAlign: 'center' }}>Choose a Finish/Vibe:</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button onClick={() => setVibe('vivid')} className={`btn btn-sm ${vibe === 'vivid' ? 'btn-primary' : 'btn-outline'}`}>Bright & Vivid</button>
                            <button onClick={() => setVibe('pastel')} className={`btn btn-sm ${vibe === 'pastel' ? 'btn-primary' : 'btn-outline'}`}>Soft Pastels</button>
                            <button onClick={() => setVibe('matte')} className={`btn btn-sm ${vibe === 'matte' ? 'btn-primary' : 'btn-outline'}`}>Matte & Muted</button>
                            <button onClick={() => setVibe('deep')} className={`btn btn-sm ${vibe === 'deep' ? 'btn-primary' : 'btn-outline'}`}>Deep & Dark</button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Generated Harmonies */}
                <div style={{ padding: '30px', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid var(--neutral-200)' }}>Your Base Shade</h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', background: baseColor, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--neutral-200)' }}></div>
                        <div>
                            <h2 style={{ margin: 0, color: baseColor }}>Foundation Color</h2>
                            <p style={{ color: 'var(--text-secondary)', margin: '5px 0 0 0' }}>This is the main color of your fabric.</p>
                        </div>
                    </div>

                    <h3 style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid var(--neutral-200)' }}>Ideal Pairings & Combinations</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                        <div>
                            <h4 style={{ marginBottom: '10px' }}>Pop & Contrast (Opposite Shades)</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>These colors sit across from each other. They create a highly dynamic and eye-catching look that really pops.</p>
                            <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '60px', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ flex: 1, background: baseColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold' }}>BASE</div>
                                <div style={{ flex: 1, background: complementary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold' }}>PAIR WITH THIS</div>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ marginBottom: '10px' }}>Smooth & Blended (Neighboring Shades)</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>These are colors right next to each other on the wheel. They blend perfectly to create a serene, unified design.</p>
                            <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '60px', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ flex: 1, background: analogous1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold', fontSize: '0.9rem' }}>ACCENT</div>
                                <div style={{ flex: 1.5, background: baseColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold' }}>BASE</div>
                                <div style={{ flex: 1, background: analogous2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', text.Shadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold', fontSize: '0.9rem' }}>ACCENT</div>
                        </div>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '10px' }}>Bold & Rich (Evenly Balanced)</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>Spaces out three colors evenly. Highly colorful and bold while still keeping a balanced, beautiful harmony.</p>
                        <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '60px', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ flex: 1, background: triadic1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold', fontSize: '0.9rem' }}>HIGHLIGHT</div>
                            <div style={{ flex: 1, background: baseColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold' }}>BASE</div>
                            <div style={{ flex: 1, background: triadic2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold', fontSize: '0.9rem' }}>HIGHLIGHT</div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
        </div >
    );
}
