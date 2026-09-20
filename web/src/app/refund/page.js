export default function RefundPage() {
    return (
        <div className="container section" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '16px' }}>Refund & Cancellation Policy</h1>
            <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>Last updated: September 2026</p>
            <div style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                <h2>1. Cancellations</h2>
                <p>Orders can be cancelled free of charge before the tailor accepts the order and starts fabric cutting.</p>
                <h2 style={{ marginTop: '20px' }}>2. Fit Guarantee & Disputes</h2>
                <p>If the received outfit does not match your provided measurements, the tailor will provide free alterations. If unresolved, our dispute system issues a full refund.</p>
            </div>
        </div>
    );
}
