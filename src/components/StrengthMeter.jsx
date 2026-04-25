import React from 'react';
import styles from './StrengthMeter.module.css';

export default function StrengthMeter({ entropy, percentage, label, theme }) {
  const isStrong = label === 'Strong';
  const themeClass = isStrong ? styles.strong 
                   : label === 'Medium' ? styles.medium 
                   : styles.weak;

  return (
    <div className={`${styles.meterContainer} glass-panel`}>
      <div className={styles.scoreWrapper}>
        <div className={`${styles.percentage} text-display ${themeClass}`}>
          {percentage}%
        </div>
        <div className={`${styles.label} text-headline`}>
          Security Level: {label.toUpperCase()}
        </div>
      </div>
      
      {/* Segmented / Filament Visualizer */}
      <div className={styles.filamentTrack}>
        <div 
          className={`${styles.filamentFill} ${themeClass}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className={`${styles.metadata} text-mono`}>
        ENTROPY: {entropy} BITS
      </div>
    </div>
  );
}
