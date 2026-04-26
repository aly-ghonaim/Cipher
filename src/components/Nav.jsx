'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '../lib/supabase';
import styles from './Nav.module.css';

const navItems = [
  {
    href: '/',
    label: 'ANALYZER',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    href: '/generator',
    label: 'GENERATOR',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    href: '/breach',
    label: 'BREACH',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    href: '/history',
    label: 'HISTORY',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    href: '/dashboard',
    label: 'DASHBOARD',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export default function Nav() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.logoBlock}>
        <span className={`${styles.logoText} text-headline`}>Cipher</span>
        <span className={styles.logoDot} />
      </div>

      {user ? (
        <div className={styles.userBlock}>
          <span className={`${styles.userEmail} text-mono`}>{user.email.split('@')[0]}</span>
          <button className={`${styles.logoutBtn} text-mono`} onClick={handleLogout}>LOGOUT</button>
        </div>
      ) : (
        <div className={styles.loginBlock}>
          <Link href="/auth" className={`${styles.loginBtn} text-mono`}>SIGN IN</Link>
          <p className={`${styles.loginHint} text-mono`}>Login to save history</p>
        </div>
      )}

      <div className={styles.links}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.link} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={`${styles.label} text-mono`}>{item.label}</span>
              {isActive && <span className={styles.activeBar} />}
            </Link>
          );
        })}
      </div>

      <div className={styles.footer}>
        <span className={`${styles.footerText} text-mono`}>v1.0.0</span>
      </div>
    </nav>
  );
}
