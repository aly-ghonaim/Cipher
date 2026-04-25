import { z } from 'zod';

const passwordSchema = z.string().max(128, "Password too long");

export function calculatePasswordEntropy(input) {
  // Zod validation acts as our strict schema validation boundary
  const parseResult = passwordSchema.safeParse(input);

  if (!parseResult.success || !parseResult.data) {
    // If validation fails (e.g., massive string pasted or wrong type), return empty safe state
    return { entropy: 0, percentage: 0, crackTime: '0 seconds', label: 'Empty' };
  }

  const password = parseResult.data;

  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;

  // E = L * log2(R)
  const entropy = password.length * Math.log2(charsetSize || 1);

  // Approximate time to crack (assuming 10 billion guesses/sec)
  const guessesPerSecond = 10000000000;
  const totalGuesses = Math.pow(2, entropy);
  const seconds = totalGuesses / guessesPerSecond;

  let crackTime = '';
  if (seconds < 1) crackTime = 'instantly';
  else if (seconds < 60) crackTime = `${Math.round(seconds)} seconds`;
  else if (seconds < 3600) crackTime = `${Math.round(seconds / 60)} minutes`;
  else if (seconds < 86400) crackTime = `${Math.round(seconds / 3600)} hours`;
  else if (seconds < 31536000) crackTime = `${Math.round(seconds / 86400)} days`;
  else if (seconds < 3153600000) crackTime = `${Math.round(seconds / 31536000)} months`;
  else crackTime = 'years';

  let label = 'Weak';
  if (entropy >= 80) label = 'Strong';
  else if (entropy >= 50) label = 'Medium';

  // Normalize entropy to a percentage strictly max 100
  const percentage = Math.min(100, Math.round((entropy / 100) * 100));

  return { entropy: Math.round(entropy), percentage, crackTime, label };
}

export function getStatusTheme(label) {
  switch (label) {
    case 'Strong': return 'primary';
    case 'Medium': return 'secondary';
    case 'Weak':
    default:
      return 'error';
  }
}
