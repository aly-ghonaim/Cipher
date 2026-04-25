"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import AnalyzerInput from '../components/AnalyzerInput';
import StrengthMeter from '../components/StrengthMeter';
import SecurityCard from '../components/SecurityCard';
import StrengthChecklist from '../components/StrengthChecklist';
import { calculatePasswordEntropy } from '../utils/entropy';
import { saveToHistory } from '../utils/historyStore';

export default function Home() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [analysis, setAnalysis] = useState({
    entropy: 0,
    percentage: 0,
    crackTime: '0 seconds',
    label: 'Empty',
    theme: 'error'
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const result = calculatePasswordEntropy(password);
      setAnalysis(result);
    } catch (e) {
      setAnalysis({
        entropy: 0,
        percentage: 0,
        crackTime: 'error',
        label: 'Empty',
        theme: 'error'
      });
    }
    setSaved(false);
  }, [password]);

  function handleSave() {
    if (!password) return;
    saveToHistory({
      password,
      strength: analysis.label,
      percentage: analysis.percentage,
      entropy: analysis.entropy,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className={styles.main}>
      <header className={styles.topBar}>
        <div className={`${styles.logo} text-headline`}>
        </div>
      </header>

      <div className={styles.grid}>
        {/* Left Column: Analytics & Stats (Asymmetrical focus) */}
        <div className={styles.colLeft}>
          <StrengthMeter
            entropy={analysis.entropy}
            percentage={analysis.percentage}
            label={analysis.label}
          />

          <div className={styles.statsContainer}>
            <SecurityCard title="threat assessment" className={styles.statsCard}>
              <div className={styles.statRow}>
                <span className={`${styles.statLabel} text-body`}>Time to crack:</span>
                <span className={`${styles.statValue} text-display`}>{analysis.crackTime}</span>
              </div>
              <div className={styles.statRow}>
                <span className={`${styles.statLabel} text-body`}>Algorithm:</span>
                <span className={`${styles.statValue} text-mono`}>SHA-256 SIM</span>
              </div> 
            </SecurityCard>
          </div>
        </div>

        {/* Right Column: Input & Controls */}
        <div className={styles.colRight}>
          <SecurityCard title="Target password" className={styles.inputCard}>
            <AnalyzerInput value={password} onChange={setPassword} />

            <StrengthChecklist password={password} />

            <div className={styles.actionArea}>
              <button
                className={`${styles.btnPrimary} text-body`}
                onClick={handleSave}
                disabled={!password}
              >
                {saved ? 'SAVED ✓' : 'SAVE TO HISTORY'}
              </button>
              <button
                className={`${styles.btnSecondary} text-body`}
                onClick={() => router.push('/generator')}
              >
                GENERATE STRONG
              </button>
            </div>
          </SecurityCard>

        </div>
      </div>
    </main>
  );
}
