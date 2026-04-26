'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import styles from './page.module.css';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess('Account created. Check your email to confirm, then sign in.');
        setMode('signin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.main}>
      <div className={`${styles.card} glass-panel`}>
        <div className={`${styles.brand} text-headline`}>CIPHER</div>
        <div className={`${styles.subtitle} text-mono`}>PASSWORD SECURITY TOOLKIT</div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} text-mono ${mode === 'signin' ? styles.activeTab : ''}`}
            onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}
          >
            SIGN IN
          </button>
          <button
            type="button"
            className={`${styles.tab} text-mono ${mode === 'signup' ? styles.activeTab : ''}`}
            onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
          >
            SIGN UP
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={`${styles.label} text-mono`}>EMAIL</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={`${styles.input} text-mono`}
            placeholder="user@example.com"
            required
          />

          <label className={`${styles.label} text-mono`}>PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={`${styles.input} text-mono`}
            placeholder="••••••••"
            required
            minLength={6}
          />

          {error && <p className={`${styles.errorMsg} text-mono`}>{error}</p>}
          {success && <p className={`${styles.successMsg} text-mono`}>{success}</p>}

          <button type="submit" className={`${styles.submitBtn} text-mono`} disabled={loading}>
            {loading ? 'LOADING...' : mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>
        </form>
      </div>
    </main>
  );
}
