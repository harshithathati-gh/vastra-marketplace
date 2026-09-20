export default function TermsPage() {
    return (
        <div className="container section" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '16px' }}>Terms of Service</h1>
            <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>Last updated: September 2026</p>
            <div style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                <h2>1. Introduction</h2>
                <p>Welcome to Vastra. By accessing or using our platform, you agree to comply with these terms.</p>
                <h2 style={{ marginTop: '20px' }}>2. Marketplace Platform</h2>
                <p>Vastra operates as an intermediary marketplace connecting customers with independent tailors.</p>
                <h2 style={{ marginTop: '20px' }}>3. Orders & Payments</h2>
                <p>Prices are quoted by individual tailors. Payments are held in escrow/test mode until order milestone acceptance.</p>
            </div>
        </div>
    );
}
