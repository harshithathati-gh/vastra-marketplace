'use client';

export default function ContactForm() {
    return (
        <form onSubmit={(e) => { e.preventDefault(); alert('Thank you! Your message has been sent to the Vastra team.'); }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: 600 }}>Your Name</label>
                <input type="text" className="form-input" required placeholder="John Doe" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: 600 }}>Email Address</label>
                <input type="email" className="form-input" required placeholder="john@example.com" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: 600 }}>Message</label>
                <textarea className="form-textarea" required rows="4" placeholder="How can we help you today?"></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>Send Message</button>
        </form>
    );
}
