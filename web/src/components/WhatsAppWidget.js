'use client';

import { useState } from 'react';

export default function WhatsAppWidget({ 
    phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919490216284',
    companyName = 'Vastra Support',
    defaultMessage = 'Namaste! I would like some help with custom tailoring on Vastra.' 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [userMessage, setUserMessage] = useState('');

    const quickQueries = [
        '📏 Help me with measurements',
        '👗 Custom design & fabric query',
        '📦 Check my order status',
        '🧵 Ask about master tailors in my city'
    ];

    const handleSend = (textToSend) => {
        const msg = textToSend || userMessage || defaultMessage;
        const encoded = encodeURIComponent(msg);
        const cleanNumber = (phoneNumber || '919490216284').replace(/[^0-9]/g, '');
        const targetNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
        const url = `https://wa.me/${targetNumber}?text=${encoded}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        setIsOpen(false);
    };

    return (
        <aside aria-label="Customer Support" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {/* Popover Card */}
            {isOpen && (
                <div 
                    style={{
                        position: 'absolute',
                        bottom: '72px',
                        right: '0',
                        width: '320px',
                        maxWidth: 'calc(100vw - 32px)',
                        background: '#ffffff',
                        borderRadius: '16px',
                        boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0,0,0,0.08)',
                        overflow: 'hidden',
                        border: '1px solid #E5E7EB',
                        animation: 'fadeInUp 0.25s ease-out',
                    }}
                >
                    {/* Header */}
                    <div style={{ background: '#075E54', color: '#ffffff', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ position: 'relative', width: '40px', height: '40px', background: '#128C7E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                🧵
                                <span style={{ position: 'absolute', bottom: '1px', right: '1px', width: '10px', height: '10px', background: '#25D366', borderRadius: '50%', border: '2px solid #075E54' }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{companyName}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Online • Replies in minutes</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            aria-label="Close support chat"
                            style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '1.4rem', cursor: 'pointer', opacity: 0.8, padding: '0 4px', lineHeight: 1 }}
                        >
                            &times;
                        </button>
                    </div>

                    {/* Chat Bubble Body */}
                    <div style={{ padding: '16px', background: '#ECE5DD', maxHeight: '340px', overflowY: 'auto' }}>
                        <div style={{ background: '#ffffff', borderRadius: '0 12px 12px 12px', padding: '12px 14px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', fontSize: '0.85rem', color: '#1F2937', lineHeight: '1.4', marginBottom: '12px' }}>
                            <p style={{ margin: '0 0 6px', fontWeight: 600 }}>Namaste! 🙏</p>
                            <p style={{ margin: 0 }}>
                                Have questions about measurements, custom designs, or picking a tailor? Chat with our team directly on WhatsApp!
                            </p>
                            <div style={{ textAlign: 'right', fontSize: '0.65rem', color: '#9CA3AF', marginTop: '4px' }}>Just now</div>
                        </div>

                        {/* Quick Action Chips */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick questions:</span>
                            {quickQueries.map((q, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(q)}
                                    style={{
                                        background: '#ffffff',
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '8px',
                                        padding: '7px 10px',
                                        fontSize: '0.78rem',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        color: '#374151',
                                        transition: 'all 0.15s ease',
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.borderColor = '#25D366'; e.currentTarget.style.color = '#075E54'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#374151'; }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer Input */}
                    <div style={{ padding: '12px', background: '#ffffff', borderTop: '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <input
                                type="text"
                                value={userMessage}
                                onChange={(e) => setUserMessage(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                                placeholder="Type your message..."
                                style={{
                                    flex: 1,
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                }}
                            />
                        </div>
                        <button
                            onClick={() => handleSend()}
                            style={{
                                width: '100%',
                                background: '#25D366',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px',
                                fontSize: '0.88rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 2px 6px rgba(37, 211, 102, 0.4)',
                                transition: 'background 0.2s ease',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#20BA5C'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#25D366'}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.693.076-1.99-.462-1.636-.677-2.697-2.348-2.779-2.457-.082-.109-.665-.884-.665-1.687 0-.803.42-1.198.57-1.36.15-.162.33-.203.44-.203.11 0 .22.001.316.006.101.005.237-.038.37.284.144.348.49 1.198.533 1.285.043.088.072.19.014.305-.058.115-.088.188-.175.29-.088.102-.185.228-.264.306-.09.088-.184.184-.079.364.105.18.468.772.998 1.246.684.61 1.26.8 1.44.887.18.087.285.073.39-.047.105-.12.449-.523.57-.703.12-.18.24-.15.4-.09.16.06 1.018.48 1.193.567.175.087.291.13.334.204.043.074.043.432-.101.837zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.436 5.176L2 22l4.981-1.306A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                            </svg>
                            Chat on WhatsApp
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Chat on WhatsApp"
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#25D366',
                    border: 'none',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 18px rgba(37, 211, 102, 0.5), 0 2px 6px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: isOpen ? 'rotate(90deg)' : 'scale(1)',
                }}
                onMouseOver={(e) => { if (!isOpen) e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseOut={(e) => { if (!isOpen) e.currentTarget.style.transform = 'scale(1)'; }}
            >
                {isOpen ? (
                    <span style={{ fontSize: '1.6rem', lineHeight: 1, fontWeight: 'bold' }}>&times;</span>
                ) : (
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.693.076-1.99-.462-1.636-.677-2.697-2.348-2.779-2.457-.082-.109-.665-.884-.665-1.687 0-.803.42-1.198.57-1.36.15-.162.33-.203.44-.203.11 0 .22.001.316.006.101.005.237-.038.37.284.144.348.49 1.198.533 1.285.043.088.072.19.014.305-.058.115-.088.188-.175.29-.088.102-.185.228-.264.306-.09.088-.184.184-.079.364.105.18.468.772.998 1.246.684.61 1.26.8 1.44.887.18.087.285.073.39-.047.105-.12.449-.523.57-.703.12-.18.24-.15.4-.09.16.06 1.018.48 1.193.567.175.087.291.13.334.204.043.074.043.432-.101.837zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.436 5.176L2 22l4.981-1.306A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                    </svg>
                )}
            </button>
        </aside>
    );
}
