export default function PrivacyPage() {
    return (
        <div className="container section" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '16px' }}>Privacy Policy</h1>
            <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>Last updated: September 2026</p>
            <div style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                <h2>1. Information We Collect</h2>
                <p>We collect body measurements, contact details, delivery address, and order design choices to fulfill tailoring orders.</p>
                <h2 style={{ marginTop: '20px' }}>2. How We Use Information</h2>
                <p>Your measurements and specifications are shared securely only with the tailor fulfilling your order.</p>
            </div>
        </div>
    );
}
