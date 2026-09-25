'use client';

import { useState, useRef, useEffect } from 'react';

export default function ColourPanelPage() {
    const [activeTab, setActiveTab] = useState('wheel');
    const [hue, setHue] = useState(0);
    const [vibe, setVibe] = useState('vivid');
    const [isDragging, setIsDragging] = useState(false);
    const [skinTone, setSkinTone] = useState('type_3');
    const wheelRef = useRef(null);

    const skinTones = [
        { id: 'type_1', label: 'Type 1 (Light, Pale White)', bg: '#f9d8c2', recommended: ['Emerald Green', 'Sapphire Blue', 'Ruby Red', 'Cool Gray', 'Pure White'] },
        { id: 'type_2', label: 'Type 2 (White, Fair)', bg: '#eeba98', recommended: ['Coral', 'Peach', 'Warm Red', 'Olive Green', 'Cream'] },
        { id: 'type_3', label: 'Type 3 (Medium, White to Olive)', bg: '#db9d71', recommended: ['Mustard Yellow', 'Jade Green', 'Cornflower Blue', 'Taupe', 'Dusty Pink'] },
        { id: 'type_4', label: 'Type 4 (Olive, Moderate Brown)', bg: '#be7444', recommended: ['Terracotta', 'Rust', 'Warm Olive', 'Rich Brown', 'Golden Yellow'] },
        { id: 'type_5', label: 'Type 5 (Brown, Dark Brown)', bg: '#8f4f2c', recommended: ['Copper', 'Burgundy', 'Earth Green', 'Deep Purple', 'Soft Teal'] },
        { id: 'type_6', label: 'Type 6 (Black, Very Dark)', bg: '#472213', recommended: ['Royal Blue', 'Fuchsia', 'Silver', 'Gold', 'Icy Blue'] }
    ];

    const exactHexes = {
        'Ruby Red': '#9b111e', 'Emerald Green': '#50c878', 'Sapphire Blue': '#0f52ba', 'Cool Gray': '#8c92ac', 'Pure White': '#ffffff', 'Cream': '#fffdd0',
        'Peach': '#ffe5b4', 'Coral': '#ff7f50', 'Golden Yellow': '#ffdf00', 'Warm Red': '#ff4500', 'Olive Green': '#808000',
        'Dusty Pink': '#dcae96', 'Jade Green': '#00a86b', 'Cornflower Blue': '#6495ed', 'Soft Teal': '#4ca3dd', 'Taupe': '#483c32',
        'Mustard Yellow': '#ffdb58', 'Terracotta': '#e2725b', 'Rust': '#b7410e', 'Warm Olive': '#556b2f', 'Rich Brown': '#4b3621',
        'Royal Blue': '#4169e1', 'Deep Purple': '#36013f', 'Fuchsia': '#ff00ff', 'Icy Blue': '#a5f2f3', 'Silver': '#c0c0c0', 'Gold': '#ffd700',
        'Copper': '#b87333', 'Rich Orange': '#ff8c00', 'Burgundy': '#800020', 'Earth Green': '#4b5320'
    };

    // Get saturation and lightness based on selected vibe
    let s = 100;
    let l = 50;

    if (vibe === 'pastel') { s = 80; l = 80; }
    else if (vibe === 'matte') { s = 40; l = 55; }
    else if (vibe === 'deep') { s = 80; l = 25; }

    // Helper to generate HSL string
    const getHSL = (h) => `hsl(${h}, ${s}%, ${l}%)`;

    // Semantic brand naming for mathematical hues
    const getColourName = (h, currentVibe) => {
        let baseName = '';
        if (h < 15 || h >= 345) baseName = 'Red';
        else if (h < 45) baseName = 'Orange';
        else if (h < 65) baseName = 'Yellow';
        else if (h < 95) baseName = 'Lime';
        else if (h < 145) baseName = 'Green';
        else if (h < 175) baseName = 'Teal';
        else if (h < 200) baseName = 'Aqua';
        else if (h < 245) baseName = 'Blue';
        else if (h < 275) baseName = 'Purple';
        else if (h < 315) baseName = 'Magenta';
        else baseName = 'Pink';
        const prefix = currentVibe === 'vivid' ? 'Vibrant' : currentVibe === 'pastel' ? 'Soft' : currentVibe === 'matte' ? 'Muted' : 'Deep';
        return `${prefix} ${baseName}`;
    };

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
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Vastra Colour Intelligence</h1>

            {/* Tab Selector */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginBottom: '40px', width: '100%' }}>
                <button
                    onClick={() => setActiveTab('wheel')}
                    className={`btn ${activeTab === 'wheel' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: '1 1 min(100%, 250px)', fontSize: '1.05rem', padding: '12px 24px' }}
                >
                    Interactive Colour Wheel
                </button>
                <button
                    onClick={() => setActiveTab('skintone')}
                    className={`btn ${activeTab === 'skintone' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: '1 1 min(100%, 250px)', fontSize: '1.05rem', padding: '12px 24px' }}
                >
                    Skin Tone Predictor
                </button>
            </div>

            {activeTab === 'wheel' && (
                <div>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '40px' }}>
                        Drag the pointer around the wheel to discover beautiful matching shades for your perfect outfit.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'flex-start' }}>

                        {/* Left Side: The Interactive Wheel */}
                        <div style={{ flex: '1 1 min(100%, 300px)', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', padding: 'clamp(20px, 4vw, 30px)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', boxSizing: 'border-box' }}>
                            <h3 style={{ marginBottom: '30px' }}>Pick a Color Family</h3>

                            <div
                                ref={wheelRef}
                                onMouseDown={(e) => { setIsDragging(true); handleInteract(e); }}
                                onTouchStart={(e) => { setIsDragging(true); handleInteract(e); }}
                                style={{
                                    width: '100%',
                                    maxWidth: '280px',
                                    aspectRatio: '1 / 1',
                                    borderRadius: '50%',
                                    background: `conic-gradient(from 0deg, ${getHSL(0)}, ${getHSL(60)}, ${getHSL(120)}, ${getHSL(180)}, ${getHSL(240)}, ${getHSL(300)}, ${getHSL(360)})`,
                                    position: 'relative',
                                    cursor: 'crosshair',
                                    touchAction: 'none',
                                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1), 0 10px 25px rgba(0,0,0,0.1)'
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '50%', left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: 'clamp(160px, 45vw, 180px)',
                                    height: 'clamp(160px, 45vw, 180px)',
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
                        <div style={{ flex: '2 1 min(100%, 300px)', padding: 'clamp(20px, 4vw, 30px)', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
                            <h3 style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid var(--neutral-200)' }}>Your Base Shade</h3>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', background: baseColor, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--neutral-200)' }}></div>
                                <div>
                                    <h2 style={{ margin: 0, color: baseColor }}>{getColourName(hue, vibe)}</h2>
                                    <p style={{ color: 'var(--text-secondary)', margin: '5px 0 0 0' }}>This is the main foundation color of your fabric.</p>
                                </div>
                            </div>

                            <h3 style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid var(--neutral-200)' }}>Ideal Pairings & Combinations</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                                <div>
                                    <h4 style={{ marginBottom: '10px' }}>Pop & Contrast (Opposite Shades)</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>These colors sit across from each other. They create a highly dynamic and eye-catching look that really pops.</p>
                                    <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '60px', boxShadow: 'var(--shadow-sm)' }}>
                                        <div style={{ flex: 1, background: baseColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold' }}>{getColourName(hue, vibe)}</div>
                                        <div style={{ flex: 1, background: complementary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold' }}>{getColourName((hue + 180) % 360, vibe)}</div>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ marginBottom: '10px' }}>Smooth & Blended (Neighboring Shades)</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>These are colors right next to each other on the wheel. They blend perfectly to create a serene, unified design.</p>
                                    <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '60px', boxShadow: 'var(--shadow-sm)' }}>
                                        <div style={{ flex: 1, background: analogous1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', padding: '0 5px' }}>{getColourName((hue + 30) % 360, vibe)}</div>
                                        <div style={{ flex: 1.5, background: baseColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold', textAlign: 'center', padding: '0 5px' }}>{getColourName(hue, vibe)}</div>
                                        <div style={{ flex: 1, background: analogous2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', padding: '0 5px' }}>{getColourName((hue - 30 + 360) % 360, vibe)}</div>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ marginBottom: '10px' }}>Bold & Rich (Evenly Balanced)</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>Spaces out three colors evenly. Highly colorful and bold while still keeping a balanced, beautiful harmony.</p>
                                    <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '60px', boxShadow: 'var(--shadow-sm)' }}>
                                        <div style={{ flex: 1, background: triadic1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', padding: '0 5px' }}>{getColourName((hue + 120) % 360, vibe)}</div>
                                        <div style={{ flex: 1, background: baseColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold', textAlign: 'center', padding: '0 5px' }}>{getColourName(hue, vibe)}</div>
                                        <div style={{ flex: 1, background: triadic2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', padding: '0 5px' }}>{getColourName((hue + 240) % 360, vibe)}</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Skin Tone Matcher Podium */}
            {activeTab === 'skintone' && (
                <div style={{ padding: 'clamp(20px, 4vw, 40px)', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '15px' }}>Skin Tone Wardrobe Predictor</h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '35px', maxWidth: '600px', margin: '0 auto 35px auto' }}>
                        Select your skin tone surface and undertone combination to instantly reveal the most flattering fabric colors that will perfectly complement your natural complexion.
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'flex-start', width: '100%' }}>

                        {/* Tone Selection */}
                        <div style={{ flex: '1 1 min(100%, 250px)', boxSizing: 'border-box' }}>
                            <h4 style={{ marginBottom: '20px' }}>Select Your Tone:</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {skinTones.map(tone => (
                                    <button
                                        key={tone.id}
                                        onClick={() => setSkinTone(tone.id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '15px',
                                            padding: '12px', border: tone.id === skinTone ? '2px solid var(--primary-500)' : '1px solid var(--neutral-300)',
                                            borderRadius: 'var(--radius-md)', background: tone.id === skinTone ? 'var(--primary-100)' : 'white',
                                            cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                                        }}
                                    >
                                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: tone.bg, border: '1px solid rgba(0,0,0,0.1)' }}></div>
                                        <span style={{ fontWeight: tone.id === skinTone ? '700' : '500', fontSize: '0.95rem' }}>{tone.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Flattering Colors Display */}
                        <div style={{ flex: '2 1 min(100%, 250px)', background: 'var(--neutral-100)', padding: 'clamp(20px, 4vw, 30px)', borderRadius: 'var(--radius-md)', boxSizing: 'border-box' }}>
                            <h4 style={{ marginBottom: '10px' }}>Your Most Flattering Combinations</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '25px' }}>
                                Based on your selection, these rich shades will seamlessly harmonize with your natural undertones, making your bespoke tailoring pop.
                            </p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                                {skinTones.find(t => t.id === skinTone)?.recommended.map(colorName => (
                                    <div key={colorName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '75px', height: '75px', borderRadius: 'var(--radius-md)',
                                            background: exactHexes[colorName] || '#dddddd',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: exactHexes[colorName] === '#ffffff' ? '1px solid #ddd' : 'none'
                                        }}></div>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-strong)' }}>{colorName}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '35px', padding: '15px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary-500)' }}>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-strong)' }}>
                                    <strong>Pro Tailor Tip:</strong> Always share your skin tone profile with your Vastra artisan. They can source specific fabric thread-counts tailored exactly to optimize these light-reflecting hues on you!
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
