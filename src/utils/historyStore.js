const HISTORY_KEY = 'pw_history';
const MAX_ENTRIES = 50;

function maskPassword(pwd) {
  if (!pwd || pwd.length === 0) return '•••';
  if (pwd.length === 1) return '•';
  if (pwd.length === 2) return pwd[0] + '•';
  return pwd[0] + '•'.repeat(Math.min(pwd.length - 2, 8)) + pwd[pwd.length - 1];
}

export function saveToHistory({ password, strength, percentage, entropy, breachCount = null }) {
  const history = getHistory();
  const entry = {
    id: Date.now().toString(),
    maskedPassword: maskPassword(password),
    strength,
    percentage,
    entropy,
    breachCount,
    timestamp: new Date().toISOString(),
  };
  const updated = [entry, ...history].slice(0, MAX_ENTRIES);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return entry;
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function deleteEntry(id) {
  const history = getHistory();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.filter(e => e.id !== id)));
}
