import ContactForm from './ContactForm';

export default function ContactUsPage() {
    return (
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ padding: '60px 20px', textAlign: 'center', background: 'linear-gradient(135deg, var(--primary-800), var(--primary-600))', color: 'white' }}>
                <div className="container">
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Get in Touch</h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>We'd love to hear from you. Here's how you can reach the Vastra team.</p>
                </div>
            </div>

            <div className="container section" style={{ flex: 1, padding: '60px 20px', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>

                    {/* Contact Info */}
                    <div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px', color: 'var(--primary-800)' }}>Contact Information</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', lineHeight: '1.6' }}>
                            Whether you have a question about tailoring, need help with an order, or just want to say hi, our team is ready to answer all your questions.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                                <div style={{ fontSize: '1.5rem' }}>📍</div>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>Our Office</h4>
                                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Vastra HQ<br />Hyderabad, Telangana<br />India</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                                <div style={{ fontSize: '1.5rem' }}>📞</div>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>Phone</h4>
                                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                                        <a href="tel:+919490216284" style={{ color: 'inherit', textDecoration: 'none' }}>+91 94902 16284</a>, <a href="tel:+918247504843" style={{ color: 'inherit', textDecoration: 'none' }}>+91 82475 04843</a>
                                    </p>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Mon-Fri from 9am to 6pm</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                                <div style={{ fontSize: '1.5rem' }}>✉️</div>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>Email</h4>
                                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}><a href="mailto:vastra123.connect@gmail.com" style={{ color: 'var(--accent-500)', textDecoration: 'none' }}>vastra123.connect@gmail.com</a></p>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Our friendly team is here to help.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form Placeholder */}
                    <div style={{ background: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--neutral-200)' }}>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>Send a Message</h3>
                        <ContactForm />
                    </div>

                </div>
            </div>
        </div>
    );
}

export const metadata = {
    title: 'Contact Us | Vastra',
    description: 'Get in touch with the Vastra team for tailoring support.',
};
