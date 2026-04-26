'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import StrengthMeter from '../../components/StrengthMeter';
import SecurityCard from '../../components/SecurityCard';
import { generatePassword } from '../../utils/generator';
import { calculatePasswordEntropy } from '../../utils/entropy';
import { saveToHistory } from '../../utils/historyStore';
import { saveToSupabase } from '../../utils/supabaseStore';

const defaultOptions = {
  length: 20,
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
};

export default function GeneratorPage() {
  const [options, setOptions] = useState(defaultOptions);
  const [generated, setGenerated] = useState('');
  const [analysis, setAnalysis] = useState({ entropy: 0, percentage: 0, label: 'Empty' });
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const regenerate = useCallback(() => {
    const pwd = generatePassword(options);
    setGenerated(pwd);
    setCopied(false);
    setSaved(false);
  }, [options]);

  useEffect(() => {
    regenerate();
  }, [options]);

  useEffect(() => {
    if (generated) {
      try {
        setAnalysis(calculatePasswordEntropy(generated));
      } catch {
        setAnalysis({ entropy: 0, percentage: 0, label: 'Empty' });
      }
    }
  }, [generated]);

  function toggleOption(key) {
    setOptions(prev => {
      const next = { ...prev, [key]: !prev[key] };
      const anyActive = next.lowercase || next.uppercase || next.numbers || next.symbols;
      return anyActive ? next : prev;
    });
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSave() {
    if (!generated) return;
    saveToHistory({ password: generated, strength: analysis.label, percentage: analysis.percentage, entropy: analysis.entropy });
    saveToSupabase({ password: generated, strength: analysis.label, percentage: analysis.percentage, entropy: analysis.entropy });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const charToggles = [
    { key: 'lowercase', label: 'a-z' },
    { key: 'uppercase', label: 'A-Z' },
    { key: 'numbers', label: '0-9' },
    { key: 'symbols', label: '!@#' },
  ];

  return (
    <main className={styles.main}>
      <header className={styles.topBar}>
        <div className={`${styles.logo} text-headline`}>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.colLeft}>
          <StrengthMeter
            entropy={analysis.entropy}
            percentage={analysis.percentage}
            label={analysis.label}
          />

          <SecurityCard title="generated password" className={styles.outputCard}>
            <div className={styles.outputRow}>
              <span className={`${styles.outputText} text-mono`}>
                {generated || '—'}
              </span>
              <button
                className={`${styles.copyBtn} text-mono`}
                onClick={handleCopy}
                disabled={!generated}
              >
                {copied ? 'COPIED' : 'COPY'}
              </button>
            </div>
          </SecurityCard>
        </div>

        <div className={styles.colRight}>
          <SecurityCard title="generation parameters">
            <div className={styles.paramSection}>
              <div className={styles.paramLabel + ' text-body'}>Length: <span className={styles.paramValue + ' text-mono'}>{options.length}</span></div>
              <input
                type="range"
                min={8}
                max={64}
                value={options.length}
                onChange={e => setOptions(prev => ({ ...prev, length: Number(e.target.value) }))}
                className={styles.slider}
              />
              <div className={styles.sliderRange}>
                <span className="text-mono">08</span>
                <span className="text-mono">64</span>
              </div>
            </div>

            <div className={styles.paramSection}>
              <div className={`${styles.paramLabel} text-body`}>Character sets</div>
              <div className={styles.toggles}>
                {charToggles.map(({ key, label }) => (
                  <button
                    key={key}
                    className={`${styles.toggle} text-mono ${options[key] ? styles.toggleActive : ''}`}
                    onClick={() => toggleOption(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.actions}>
              <button className={`${styles.btnPrimary} text-body`} onClick={regenerate}>
                REGENERATE
              </button>
              <button
                className={`${styles.btnSecondary} text-body`}
                onClick={handleSave}
                disabled={!generated}
              >
                {saved ? 'SAVED ✓' : 'SAVE TO HISTORY'}
              </button>
            </div>
          </SecurityCard>
        </div>
      </div>
    </main>
  );
}
