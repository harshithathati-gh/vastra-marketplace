import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="container section" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '16px' }}>About Vastra</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '24px' }}>
                Vastra is India's custom tailoring marketplace connecting customers with skilled local tailors across the nation.
            </p>

            <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Our Mission</h2>
                <p style={{ color: 'var(--text-tertiary)', lineHeight: '1.7' }}>
                    We aim to preserve and modernize traditional Indian craftsmanship by giving local tailors a digital storefront while providing customers with perfect-fitting custom clothing delivered right to their doorstep.
                </p>
            </div>

            <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Why Choose Vastra?</h2>
            <ul style={{ lineHeight: '2', color: 'var(--text-secondary)', paddingLeft: '20px', marginBottom: '32px' }}>
                <li><strong>Verified Artisans:</strong> Every tailor on Vastra undergoes background and portfolio checks.</li>
                <li><strong>Guided Measurements:</strong> Save measurement profiles for yourself and family members.</li>
                <li><strong>Transparent Pricing:</strong> Receive itemized price quotes before paying any advance.</li>
                <li><strong>Quality Guarantee:</strong> In-app messaging and dispute protection ensure you get the exact design you ordered.</li>
            </ul>

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <Link href="/products" className="btn btn-primary btn-lg">Explore Catalog →</Link>
            </div>
        </div>
    );
}
