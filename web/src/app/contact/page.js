'use client';

export default function ContactPage() {
    return (
        <div className="container section" style={{ maxWidth: '640px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '16px' }}>Contact Support</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Have a question about an order, payment, or measurement? We're here to help!
            </p>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={(e) => { e.preventDefault(); alert('Message sent! Our support team will get back to you shortly.'); }}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" className="form-input" placeholder="Your name" required />
                </div>
                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" className="form-input" placeholder="you@example.com" required />
                </div>
                <div className="form-group">
                    <label>Subject</label>
                    <input type="text" className="form-input" placeholder="Order ID or general inquiry" required />
                </div>
                <div className="form-group">
                    <label>Message</label>
                    <textarea className="form-textarea" rows={5} placeholder="Describe your question in detail..." required />
                </div>
                <button type="submit" className="btn btn-primary btn-full">Send Message</button>
            </form>
        </div>
    );
}
