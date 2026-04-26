import { supabase } from '../lib/supabase'

function maskPassword(pwd) {
  if (!pwd || pwd.length === 0) return '•••'
  if (pwd.length === 1) return '•'
  if (pwd.length === 2) return pwd[0] + '•'
  return pwd[0] + '•'.repeat(Math.min(pwd.length - 2, 8)) + pwd[pwd.length - 1]
}

export async function saveToSupabase({ password, strength, percentage, entropy, breachCount = null }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('password_history')
    .insert({
      user_id: user.id,
      masked_password: maskPassword(password),
      strength,
      percentage,
      entropy,
      breach_count: breachCount,
    })
    .select()
    .single()

  if (error) console.error('Supabase save error:', error)
  return data
}

export async function getSupabaseHistory() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('password_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) { console.error('Supabase fetch error:', error); return null }

  return data.map(row => ({
    id: row.id,
    maskedPassword: row.masked_password,
    strength: row.strength,
    percentage: row.percentage,
    entropy: Number(row.entropy),
    breachCount: row.breach_count,
    timestamp: row.created_at,
  }))
}

export async function deleteSupabaseEntry(id) {
  const { error } = await supabase.from('password_history').delete().eq('id', id)
  if (error) console.error('Supabase delete error:', error)
}

export async function clearSupabaseHistory() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { error } = await supabase.from('password_history').delete().eq('user_id', user.id)
  if (error) console.error('Supabase clear error:', error)
}
