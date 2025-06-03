import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)


/**
 * Fast login: insert phone if new, do nothing if exists
 * Works for new + returning users across devices
 */

export async function loginWithPhone(phone: string): Promise<{ success: boolean }> {
  if (!phone) return { success: false }

  try {
    const { error } = await supabase
      .from("users")
      .upsert([{ phone }], { onConflict: "phone" })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false }
  }
}