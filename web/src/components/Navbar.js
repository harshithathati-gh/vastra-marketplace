'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const isActive = (path) => pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="container navbar-inner">
                <Link href="/" className="navbar-logo">
                    Va<span>stra</span>
                </Link>

                <ul className="navbar-links" style={menuOpen ? { display: 'flex', position: 'absolute', top: '70px', left: 0, right: 0, background: 'white', flexDirection: 'column', padding: '20px', gap: '16px', borderBottom: '1px solid var(--neutral-200)', zIndex: 99 } : {}}>
                    <li><Link href="/colour-panel" className={isActive('/colour-panel')} onClick={() => setMenuOpen(false)}>Colour Panel</Link></li>
                    {(!user || user.role === 'customer') && (
                        <>
                            <li><Link href="/products" className={isActive('/products')}>Products</Link></li>
                            <li><Link href="/tailors" className={isActive('/tailors')}>Find Tailors</Link></li>
                        </>
                    )}
                    {user && user.role === 'customer' && (
                        <>
                            <li><Link href="/dashboard/orders" className={pathname.startsWith('/dashboard') ? 'active' : ''}>My Orders</Link></li>
                            <li><Link href="/dashboard/messages" className={isActive('/dashboard/messages')}>Messages</Link></li>
                        </>
                    )}
                    {user && user.role === 'tailor' && (
                        <>
                            <li><Link href="/tailor/dashboard" className={pathname.startsWith('/tailor') ? 'active' : ''}>Dashboard</Link></li>
                        </>
                    )}
                    {user && user.role === 'admin' && (
                        <li><Link href="/admin" className={pathname.startsWith('/admin') ? 'active' : ''}>Admin</Link></li>
                    )}
                </ul>

                <div className="navbar-actions">
                    {!user ? (
                        <>
                            <Link href="/login" className="btn btn-outline btn-sm">Log In</Link>
                            <Link href="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                        </>
                    ) : (
                        <div style={{ position: 'relative' }}>
                            <div
                                className="navbar-avatar"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                title={user.name}
                            >
                                {user.avatar ? (
                                    <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    user.name?.charAt(0).toUpperCase()
                                )}
                            </div>
                            {dropdownOpen && (
                                <div style={{
                                    position: 'absolute', right: 0, top: '48px', background: 'white',
                                    borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xl)',
                                    border: '1px solid var(--neutral-200)', minWidth: '200px', zIndex: 999,
                                    overflow: 'hidden',
                                }}>
                                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--neutral-100)' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{user.email}</div>
                                        <span className="badge badge-accent" style={{ marginTop: '6px' }}>{user.role}</span>
                                    </div>
                                    {user.role === 'customer' && (
                                        <>
                                            <Link href="/dashboard/orders" style={{ display: 'block', padding: '10px 16px', fontSize: '0.88rem', color: 'var(--text-secondary)' }} onClick={() => setDropdownOpen(false)}>📦 My Orders</Link>
                                            <Link href="/dashboard/measurements" style={{ display: 'block', padding: '10px 16px', fontSize: '0.88rem', color: 'var(--text-secondary)' }} onClick={() => setDropdownOpen(false)}>📏 Measurements</Link>
                                            <Link href="/dashboard/messages" style={{ display: 'block', padding: '10px 16px', fontSize: '0.88rem', color: 'var(--text-secondary)' }} onClick={() => setDropdownOpen(false)}>💬 Messages</Link>
                                        </>
                                    )}
                                    {user.role === 'tailor' && (
                                        <>
                                            <Link href="/tailor/dashboard" style={{ display: 'block', padding: '10px 16px', fontSize: '0.88rem', color: 'var(--text-secondary)' }} onClick={() => setDropdownOpen(false)}>📊 Dashboard</Link>
                                            <Link href="/tailor/orders" style={{ display: 'block', padding: '10px 16px', fontSize: '0.88rem', color: 'var(--text-secondary)' }} onClick={() => setDropdownOpen(false)}>📦 Orders</Link>
                                            <Link href="/tailor/profile" style={{ display: 'block', padding: '10px 16px', fontSize: '0.88rem', color: 'var(--text-secondary)' }} onClick={() => setDropdownOpen(false)}>✏️ Edit Profile</Link>
                                        </>
                                    )}
                                    <div style={{ borderTop: '1px solid var(--neutral-100)' }}>
                                        <button onClick={() => { logout(); setDropdownOpen(false); }} style={{ display: 'block', width: '100%', padding: '10px 16px', fontSize: '0.88rem', color: 'var(--error)', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>🚪 Log Out</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <button className="navbar-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>
        </nav>
    );
}
