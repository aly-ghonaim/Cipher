'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import styles from './GuestBanner.module.css';

export default function GuestBanner() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (user === undefined || user !== null) return null;

  return (
    <div className={styles.banner}>
      <span className={`${styles.text} text-mono`}>
        Sign in to save passwords, sync history across devices, and unlock your security dashboard.
      </span>
      <Link href="/auth" className={`${styles.btn} text-mono`}>
        SIGN IN →
      </Link>
    </div>
  );
}
