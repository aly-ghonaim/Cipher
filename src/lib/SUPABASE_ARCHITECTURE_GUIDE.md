# Supabase Security Architecture Guide

Based on the [Security Audit Prompt for Vibecode] principles, here is how you must structure your Supabase implementation when you integrate it.

## 1. Environment Variable Safety (Section 1.3)
Ensure your `.env.local` is strictly divided:

```env
# ✅ PUBLIC - Safe for client-side
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# ❌ PRIVATE - NEVER PREFIX WITH NEXT_PUBLIC_ (Section 1.3 & 2.5)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 2. Authentication & Session Management (Section 3.3)
When creating API routes or Server Actions, **never** use `getSession()` to verify identity, as it can be spoofed by a modified local JWT.

```javascript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// In a Server Action / API Route:
export async function securelyUpdateUser() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
      },
    }
  )

  // ✅ CORRECT (Section 3.3): Validates against Supabase Servers
  const { data: { user }, error } = await supabase.auth.getUser() 

  // ❌ WRONG: Only reads local, spoofable cookie
  // const { data: { session } } = await supabase.auth.getSession()
}
```

## 3. Database Security (Section 2.1 - 2.4)
When you build your Schema, run these audits in your Supabase SQL editor:

1. **Enable RLS on EVERY Table**: Even seemingly public tables should have RLS with a `SELECT` policy allowing anon access, rather than leaving RLS disabled.
2. **Use auth.uid()**: 
   ```sql
   -- ✅ CORRECT: Uses secure internal identity
   CREATE POLICY "User can update their own data" ON "data_table"
   FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
   ```
3. **Always use WITH CHECK**: Ensure Users cannot `INSERT` or `UPDATE` a row with someone else's `user_id`. (Section 2.3)
