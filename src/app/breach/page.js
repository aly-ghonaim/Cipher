'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import AnalyzerInput from '../../components/AnalyzerInput';
import SecurityCard from '../../components/SecurityCard';
import { checkBreach } from '../../utils/breach';
import { saveToHistory } from '../../utils/historyStore';

const STATUS = { IDLE: 'idle', LOADING: 'loading', SAFE: 'safe', BREACHED: 'breached', ERROR: 'error' };
const COOLDOWN_MS = 3000;

export default function BreachPage() {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(STATUS.IDLE);
  const [breachCount, setBreachCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastCheck, setLastCheck] = useState(0);

  async function handleCheck() {
    if (!password) return;
    if (Date.now() - lastCheck < COOLDOWN_MS) return;
    setLastCheck(Date.now());
    setStatus(STATUS.LOADING);
    setErrorMsg('');
    try {
      const count = await checkBreach(password);
      setBreachCount(count);
      setStatus(count > 0 ? STATUS.BREACHED : STATUS.SAFE);

      saveToHistory({
        password,
        strength: count > 0 ? 'Weak' : 'Strong',
        percentage: count > 0 ? 10 : 90,
        entropy: 0,
        breachCount: count,
      });
    } catch {
      setStatus(STATUS.ERROR);
      setErrorMsg('Unable to reach breach database. Check your connection.');
    }
  }

  function handleReset() {
    setPassword('');
    setStatus(STATUS.IDLE);
    setBreachCount(0);
  }

  return (
    <main className={styles.main}>
      <header className={styles.topBar}>
        <div className={`${styles.logo} text-headline`}>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.colLeft}>
          <SecurityCard title="target password">
            <AnalyzerInput value={password} onChange={setPassword} />

            <p className={`${styles.hint} text-body`}>
              Uses k-anonymity — only the first 5 characters of your password hash are sent. Your password never leaves this device.
            </p>

            <div className={styles.actionArea}>
              <button
                className={`${styles.btnPrimary} text-body`}
                onClick={handleCheck}
                disabled={!password || status === STATUS.LOADING}
              >
                {status === STATUS.LOADING ? 'SCANNING...' : 'SCAN FOR BREACHES'}
              </button>
              {status !== STATUS.IDLE && (
                <button className={`${styles.btnSecondary} text-body`} onClick={handleReset}>
                  RESET
                </button>
              )}
            </div>
          </SecurityCard>
        </div>

        <div className={styles.colRight}>
          {status === STATUS.IDLE && (
            <div className={styles.idleState}>
              <div className={styles.idleIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <p className={`${styles.idleText} text-body`}>Enter a password and run a scan to check if it has appeared in known data breaches.</p>
            </div>
          )}

          {status === STATUS.LOADING && (
            <div className={styles.loadingState}>
              <div className={styles.scanLine} />
              <p className={`${styles.loadingText} text-mono`}>QUERYING BREACH DATABASE...</p>
            </div>
          )}

          {status === STATUS.SAFE && (
            <SecurityCard title="scan result">
              <div className={styles.resultSafe}>
                <div className={`${styles.resultIcon} ${styles.safeIcon}`}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className={`${styles.resultTitle} text-display`}>SECURE</div>
                <div className={`${styles.resultSub} text-body`}>Not found in any known breach database.</div>
                <div className={`${styles.resultMeta} text-mono`}>0 EXPOSURES DETECTED</div>
              </div>
            </SecurityCard>
          )}

          {status === STATUS.BREACHED && (
            <SecurityCard title="scan result">
              <div className={styles.resultBreached}>
                <div className={`${styles.resultIcon} ${styles.breachedIcon}`}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className={`${styles.resultCount} text-display`}>{breachCount.toLocaleString()}</div>
                <div className={`${styles.resultTitle} ${styles.breachedTitle} text-display`}>BREACHES</div>
                <div className={`${styles.resultSub} text-body`}>This password has been exposed. Do not use it.</div>
                <div className={`${styles.resultMeta} text-mono`}>CHANGE IMMEDIATELY</div>
              </div>
            </SecurityCard>
          )}

          {status === STATUS.ERROR && (
            <SecurityCard title="scan result">
              <div className={styles.resultError}>
                <div className={`${styles.resultTitle} text-display`}>ERROR</div>
                <div className={`${styles.resultSub} text-body`}>{errorMsg}</div>
              </div>
            </SecurityCard>
          )}
        </div>
      </div>
    </main>
  );
}
