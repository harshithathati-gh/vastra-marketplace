export default function FAQPage() {
    const faqs = [
        { q: 'How does tailoring work on Vastra?', a: 'You browse products or tailors, submit your measurements and requirements, receive a price quote from the tailor, and approve it to start stitching.' },
        { q: 'Can I provide my own fabric?', a: 'Yes! When placing an order, you can choose whether to ship your own fabric to the tailor or let the tailor source high-quality fabric for you.' },
        { q: 'How are measurements taken?', a: 'You can follow our step-by-step measurement guide (with diagram instructions) or save profile templates for future orders.' },
        { q: 'What if the garment does not fit perfectly?', a: 'Tailors offer free alterations within 7 days of delivery. You can also raise a dispute if there are sizing discrepancies.' },
        { q: 'When is payment collected?', a: 'Payment is collected in test mode via Razorpay only after you review and accept the tailor’s custom price quote.' },
    ];

    return (
        <div className="container section" style={{ maxWidth: '720px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '16px' }}>Frequently Asked Questions</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Find answers to common questions about ordering, measurements, and delivery.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {faqs.map((faq, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--primary-700)' }}>Q: {faq.q}</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>{faq.a}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
