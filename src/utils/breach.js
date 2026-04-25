async function sha1Hex(text) {
  const buffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

export async function checkBreach(password) {
  if (typeof password !== 'string' || password.length === 0 || password.length > 128) {
    throw new Error('Invalid password input');
  }
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { 'Add-Padding': 'true' },
  });

  if (!response.ok) throw new Error(`Breach API error: ${response.status}`);

  const text = await response.text();
  for (const line of text.split('\n')) {
    const [hashSuffix, count] = line.split(':');
    if (hashSuffix && hashSuffix.trim() === suffix) {
      return parseInt(count.trim(), 10);
    }
  }
  return 0;
}
