import React from 'react';
import styles from './SecurityCard.module.css';

export default function SecurityCard({ title, children, className = '' }) {
  return (
    <div className={`${styles.card} ${className}`}>
      {title && (
        <div className={styles.header}>
          <h2 className={`${styles.title} text-headline`}>{title}</h2>
        </div>
      )}
      <div className={styles.body}>
        {children}
      </div>
    </div>
  );
}
