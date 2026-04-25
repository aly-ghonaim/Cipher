'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import SecurityCard from '../../components/SecurityCard';
import { getHistory } from '../../utils/historyStore';

function computeStats(history) {
  const total = history.length;
  if (total === 0) return null;

  const avgStrength = Math.round(history.reduce((sum, e) => sum + e.percentage, 0) / total);
  const breachedCount = history.filter(e => e.breachCount !== null && e.breachCount > 0).length;

  const strengthCounts = { Weak: 0, Medium: 0, Strong: 0 };
  history.forEach(e => { if (e.strength in strengthCounts) strengthCounts[e.strength]++; });

  const weakest = history.reduce((min, e) => (!min || e.percentage < min.percentage ? e : min), null);

  return { total, avgStrength, breachedCount, strengthCounts, weakest };
}

function StatCard({ label, value, sub, theme }) {
  const themeClass = theme === 'primary' ? styles.cardPrimary : theme === 'error' ? styles.cardError : styles.cardDefault;
  return (
    <div className={`${styles.statCard} glass-panel ${themeClass}`}>
      <div className={`${styles.statValue} text-display`}>{value}</div>
      <div className={`${styles.statLabel} text-mono`}>{label}</div>
      {sub && <div className={`${styles.statSub} text-body`}>{sub}</div>}
    </div>
  );
}

function DistributionBar({ counts, total }) {
  const strongPct = total ? (counts.Strong / total) * 100 : 0;
  const mediumPct = total ? (counts.Medium / total) * 100 : 0;
  const weakPct = total ? (counts.Weak / total) * 100 : 0;

  return (
    <div className={styles.distWrapper}>
      <div className={styles.distBar}>
        {strongPct > 0 && <div className={`${styles.distSegment} ${styles.segStrong}`} style={{ width: `${strongPct}%` }} />}
        {mediumPct > 0 && <div className={`${styles.distSegment} ${styles.segMedium}`} style={{ width: `${mediumPct}%` }} />}
        {weakPct > 0 && <div className={`${styles.distSegment} ${styles.segWeak}`} style={{ width: `${weakPct}%` }} />}
      </div>
      <div className={styles.distLegend}>
        <span className={`${styles.legendItem} ${styles.legendStrong} text-mono`}>STRONG {counts.Strong}</span>
        <span className={`${styles.legendItem} ${styles.legendMedium} text-mono`}>MEDIUM {counts.Medium}</span>
        <span className={`${styles.legendItem} ${styles.legendWeak} text-mono`}>WEAK {counts.Weak}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setStats(computeStats(getHistory()));
  }, []);

  return (
    <main className={styles.main}>
      <header className={styles.topBar}>
        <div className={`${styles.logo} text-headline`}>
        </div>
      </header>

      {!stats ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <p className={`${styles.emptyTitle} text-headline`}>No data yet</p>
          <p className={`${styles.emptySub} text-body`}>Analyze or generate passwords to see your security metrics here.</p>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.statsRow}>
            <StatCard label="TOTAL ANALYZED" value={stats.total} />
            <StatCard
              label="AVG STRENGTH"
              value={`${stats.avgStrength}%`}
              theme={stats.avgStrength >= 80 ? 'primary' : stats.avgStrength >= 50 ? 'default' : 'error'}
            />
            <StatCard
              label="BREACHED"
              value={stats.breachedCount}
              sub={stats.breachedCount > 0 ? 'need changing' : 'all clear'}
              theme={stats.breachedCount > 0 ? 'error' : 'primary'}
            />
          </div>

          <div className={styles.bottomRow}>
            <SecurityCard title="strength distribution" className={styles.distCard}>
              <DistributionBar counts={stats.strengthCounts} total={stats.total} />
              <div className={styles.distStats}>
                <div className={styles.distStatRow}>
                  <span className={`${styles.distStatLabel} text-body`}>Most common:</span>
                  <span className={`${styles.distStatValue} text-mono`}>
                    {Object.entries(stats.strengthCounts).sort((a, b) => b[1] - a[1])[0][0].toUpperCase()}
                  </span>
                </div>
                <div className={styles.distStatRow}>
                  <span className={`${styles.distStatLabel} text-body`}>Safe rate:</span>
                  <span className={`${styles.distStatValue} text-mono`}>
                    {Math.round(((stats.total - stats.breachedCount) / stats.total) * 100)}%
                  </span>
                </div>
              </div>
            </SecurityCard>

            {stats.weakest && (
              <SecurityCard title="weakest entry" className={styles.weakestCard}>
                <div className={styles.weakestContent}>
                  <div className={`${styles.weakestPassword} text-mono`}>{stats.weakest.maskedPassword}</div>
                  <div className={styles.weakestMeta}>
                    <div className={styles.weakestScore}>
                      <span className={`${styles.weakestPct} text-display`}>{stats.weakest.percentage}%</span>
                      <span className={`${styles.weakestLabel} text-mono`}>{stats.weakest.strength.toUpperCase()}</span>
                    </div>
                    <div className={`${styles.weakestHint} text-body`}>
                      {stats.weakest.entropy > 0 ? `${stats.weakest.entropy} bits entropy` : 'Low entropy detected'}
                    </div>
                    {stats.weakest.breachCount > 0 && (
                      <div className={`${styles.weakestBreached} text-mono`}>
                        FOUND IN {stats.weakest.breachCount.toLocaleString()} BREACHES
                      </div>
                    )}
                  </div>
                </div>
              </SecurityCard>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
