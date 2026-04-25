const CHARSETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

export function generatePassword({ length = 16, lowercase = true, uppercase = true, numbers = true, symbols = true }) {
  const selected = [];
  if (lowercase) selected.push(CHARSETS.lowercase);
  if (uppercase) selected.push(CHARSETS.uppercase);
  if (numbers) selected.push(CHARSETS.numbers);
  if (symbols) selected.push(CHARSETS.symbols);

  if (selected.length === 0) return '';

  const charset = selected.join('');
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  const pwArray = Array.from(randomValues).map(n => charset[n % charset.length]);

  // Guarantee at least one char from each selected charset
  const guaranteeSlots = new Uint32Array(selected.length);
  crypto.getRandomValues(guaranteeSlots);
  selected.forEach((set, i) => {
    pwArray[i] = set[guaranteeSlots[i] % set.length];
  });

  // Fisher-Yates shuffle using crypto random values
  const shuffleValues = new Uint32Array(pwArray.length);
  crypto.getRandomValues(shuffleValues);
  for (let i = pwArray.length - 1; i > 0; i--) {
    const j = shuffleValues[i] % (i + 1);
    [pwArray[i], pwArray[j]] = [pwArray[j], pwArray[i]];
  }

  return pwArray.join('');
}
