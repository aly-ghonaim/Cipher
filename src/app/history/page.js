'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { getHistory, deleteEntry, clearHistory } from '../../utils/historyStore';
import { getSupabaseHistory, deleteSupabaseEntry, clearSupabaseHistory } from '../../utils/supabaseStore';

function StrengthBadge({ label }) {
  const cls = label === 'Strong' ? styles.badgeStrong : label === 'Medium' ? styles.badgeMedium : styles.badgeWeak;
  return <span className={`${styles.badge} ${cls} text-mono`}>{label.toUpperCase()}</span>;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [isCloud, setIsCloud] = useState(false);

  useEffect(() => {
    async function load() {
      const cloudData = await getSupabaseHistory();
      if (cloudData !== null) {
        setHistory(cloudData);
        setIsCloud(true);
      } else {
        setHistory(getHistory());
        setIsCloud(false);
      }
    }
    load();
  }, []);

  async function handleDelete(id) {
    if (isCloud) {
      await deleteSupabaseEntry(id);
      const updated = await getSupabaseHistory();
      setHistory(updated ?? []);
    } else {
      deleteEntry(id);
      setHistory(getHistory());
    }
  }

  async function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    if (isCloud) {
      await clearSupabaseHistory();
    } else {
      clearHistory();
    }
    setHistory([]);
    setConfirmClear(false);
  }

  return (
    <main className={styles.main}>
      <header className={styles.topBar}>
        <div className={`${styles.logo} text-headline`}>
        </div>
        {history.length > 0 && (
          <button
            className={`${styles.clearBtn} text-mono ${confirmClear ? styles.clearBtnConfirm : ''}`}
            onClick={handleClear}
          >
            {confirmClear ? 'CONFIRM CLEAR?' : 'CLEAR ALL'}
          </button>
        )}
      </header>

      {history.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <p className={`${styles.emptyTitle} text-headline`}>No history yet</p>
          <p className={`${styles.emptySub} text-body`}>Passwords you analyze or generate will appear here.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <div className={styles.tableHeader}>
            <span className={`${styles.col} ${styles.colPassword} text-mono`}>PASSWORD</span>
            <span className={`${styles.col} ${styles.colStrength} text-mono`}>STRENGTH</span>
            <span className={`${styles.col} ${styles.colEntropy} text-mono`}>ENTROPY</span>
            <span className={`${styles.col} ${styles.colBreach} text-mono`}>BREACH</span>
            <span className={`${styles.col} ${styles.colDate} text-mono`}>DATE</span>
            <span className={`${styles.col} ${styles.colAction}`} />
          </div>

          <div className={styles.tableBody}>
            {history.map(entry => (
              <div key={entry.id} className={styles.tableRow}>
                <span className={`${styles.col} ${styles.colPassword} text-mono`}>{entry.maskedPassword}</span>
                <span className={`${styles.col} ${styles.colStrength}`}>
                  <StrengthBadge label={entry.strength} />
                </span>
                <span className={`${styles.col} ${styles.colEntropy} text-mono`}>
                  {entry.entropy > 0 ? `${entry.entropy} bits` : '—'}
                </span>
                <span className={`${styles.col} ${styles.colBreach} text-mono`}>
                  {entry.breachCount === null ? '—' : entry.breachCount === 0 ? (
                    <span className={styles.safeDot}>SAFE</span>
                  ) : (
                    <span className={styles.breachedDot}>{entry.breachCount.toLocaleString()}×</span>
                  )}
                </span>
                <span className={`${styles.col} ${styles.colDate} text-body`}>{formatDate(entry.timestamp)}</span>
                <span className={`${styles.col} ${styles.colAction}`}>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(entry.id)}
                    aria-label="Delete entry"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </span>
              </div>
            ))}
          </div>

          <div className={`${styles.tableFooter} text-mono`}>
            {history.length} ENTRIES // MAX 50
          </div>
        </div>
      )}
    </main>
  );
}
