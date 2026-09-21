'use client';

import { useState, useRef, useEffect } from 'react';

export default function ColourPanelPage() {
    const [hue, setHue] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const wheelRef = useRef(null);

    // Helper to generate HSL string
    const getHSL = (h, s = 100, l = 50) => `hsl(${h}, ${s}%, ${l}%)`;

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

        // Handle both mouse and touch events
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - centerX;
        const dy = clientY - centerY;

        // Math.atan2 gives angle from positive x-axis (right), CSS gradients start from top.
        // We'll just map the raw geometric angle (0-360) to the hue directly.
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);

        // Shift angle so 0 is at the top matching standard conic gradients 
        // (CSS 0deg is top, atan2 0 is right)
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
                // Prevent scrolling when dragging wheel on mobile
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
            <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Interactive Colour Wheel</h1>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '50px' }}>
                Drag the pointer on the rainbox wheel to generate perfectly balanced mathematical color harmonies.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '40px', alignItems: 'start' }}>

                {/* Left Side: The Interactive Wheel */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
                    <h3 style={{ marginBottom: '30px' }}>Select Base Shade</h3>

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
                        {/* The middle cutout to make it a ring (optional, but looks better) */}
                        <div style={{
                            position: 'absolute',
                            top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '180px', height: '180px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.1)'
                        }}></div>

                        {/* The Draggable Arrow/Pointer */}
                        <div style={{
                            position: 'absolute',
                            top: '50%', left: '50%',
                            width: '100%', height: '100%',
                            transform: `translate(-50%, -50%) rotate(${hue}deg)`,
                            pointerEvents: 'none'
                        }}>
                            {/* Arrow Head Pointing to the selected color */}
                            <div style={{
                                position: 'absolute',
                                top: '-10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '20px',
                                height: '20px',
                                backgroundColor: 'white',
                                border: '3px solid #333',
                                borderRadius: '50%',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                            }}></div>
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Selected Hue Angle: {hue}°</span>
                    </div>
                </div>

                {/* Right Side: Generated Harmonies */}
                <div style={{ padding: '30px', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid var(--neutral-200)' }}>Your Selected Shade</h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', background: baseColor, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--neutral-200)' }}></div>
                        <div>
                            <h2 style={{ margin: 0, color: baseColor }}>{baseColor}</h2>
                            <p style={{ color: 'var(--text-secondary)', margin: '5px 0 0 0' }}>Base Foundation Color</p>
                        </div>
                    </div>

                    <h3 style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid var(--neutral-200)' }}>Matching Harmonies</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                        {/* Contrast / Complementary */}
                        <div>
                            <h4 style={{ marginBottom: '10px' }}>High Contrast / Complementary</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>Exact opposite on the wheel. Highly dynamic and makes elements pop.</p>
                            <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '60px', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ flex: 1, background: baseColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold' }}>BASE</div>
                                <div style={{ flex: 1, background: complementary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold' }}>{complementary}</div>
                            </div>
                        </div>

                        {/* Analogous / Matching */}
                        <div>
                            <h4 style={{ marginBottom: '10px' }}>Analogous / Smooth Matching</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>Neighboring colors on the wheel. Creates a serene, unified design.</p>
                            <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '60px', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ flex: 1, background: analogous1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold', fontSize: '0.9rem' }}>{analogous1}</div>
                                <div style={{ flex: 1.5, background: baseColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold' }}>BASE</div>
                                <div style={{ flex: 1, background: analogous2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold', fontSize: '0.9rem' }}>{analogous2}</div>
                            </div>
                        </div>

                        {/* Triadic / Balanced */}
                        <div>
                            <h4 style={{ marginBottom: '10px' }}>Triadic / Boldly Balanced</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>Evenly spaced around the wheel. Rich colors while retaining harmony.</p>
                            <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '60px', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ flex: 1, background: triadic1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold', fontSize: '0.9rem' }}>{triadic1}</div>
                                <div style={{ flex: 1, background: baseColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold' }}>BASE</div>
                                <div style={{ flex: 1, background: triadic2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold', fontSize: '0.9rem' }}>{triadic2}</div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
