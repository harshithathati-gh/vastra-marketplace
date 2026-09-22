import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid var(--primary-100)' }}>
                                <img src="/logo.png" alt="Vastra Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <h3 style={{ margin: 0 }}>Va<span>stra</span></h3>
                        </div>
                        <p style={{ fontWeight: 600, fontStyle: 'italic', marginBottom: '10px', color: 'var(--primary-400)' }}>From local hands to your homes !</p>
                        <p>Connecting customers with skilled local tailors across India. Get custom-tailored clothing at affordable prices, delivered to your doorstep.</p>
                    </div>
                    <div className="footer-col">
                        <h4>Explore</h4>
                        <ul>
                            <li><Link href="/products">Products</Link></li>
                            <li><Link href="/tailors">Find Tailors</Link></li>
                            <li><Link href="/register?role=tailor">Become a Tailor</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Support</h4>
                        <ul>
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                            <li><Link href="/faq">FAQ</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Legal</h4>
                        <ul>
                            <li><Link href="/terms">Terms of Service</Link></li>
                            <li><Link href="/privacy">Privacy Policy</Link></li>
                            <li><Link href="/refund">Refund Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} Vastra. All rights reserved. Made with 🧵 in India.</p>
                </div>
            </div>
        </footer>
    );
}
