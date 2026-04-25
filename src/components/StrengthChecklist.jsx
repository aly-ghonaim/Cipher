import React from 'react';
import styles from './StrengthChecklist.module.css';

function CheckIcon({ checked }) {
  return (
    <div className={`${styles.iconContainer} ${checked ? styles.checkedIcon : styles.uncheckedIcon}`}>
      {checked ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      )}
    </div>
  );
}

export default function StrengthChecklist({ password }) {
  const criteria = [
    { label: 'At least 8 characters', fulfilled: password.length >= 8 },
    { label: 'Includes an uppercase letter', fulfilled: /[A-Z]/.test(password) },
    { label: 'Includes a number', fulfilled: /[0-9]/.test(password) },
    { label: 'Includes a special character', fulfilled: /[^a-zA-Z0-9]/.test(password) && password.length > 0 }
  ];

  return (
    <div className={styles.checklistContainer}>
      {criteria.map((item, idx) => (
        <div key={idx} className={`${styles.checkItem} ${item.fulfilled ? styles.fulfilled : ''}`}>
          <CheckIcon checked={item.fulfilled} />
          <span className="text-body">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
