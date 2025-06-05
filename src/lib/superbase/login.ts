import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Smart login:
 * 1. Check if phone exists
 * 2. If not, insert it
 * 3. If exists, return data_compressed
 */

export async function loginWithPhone(phone: string): Promise<{
  success: boolean
  dataCompressed?: string
}> {
  const normalizedPhone = phone.replace("+", "");

  if (!phone) return { success: false }

  try {
    const { data, error: fetchError } = await supabase
      .from("users")
      .select("data_compressed")
      .eq("phone", normalizedPhone)
      .maybeSingle()

    if (fetchError && fetchError.code !== "PGRST116") throw fetchError

    if (data) {
      return {
        success: true,
        dataCompressed: data.data_compressed,
      }
    }

    const { error: insertError } = await supabase
      .from("users")
      .insert([{ phone: normalizedPhone }])

    if (insertError) throw insertError

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false }
  }
}

export async function updateCompressedData(phone: string, compressedString: string): Promise<{ success: boolean }> {
  const normalizedPhone = phone.replace("+", "");

  if (!phone || !compressedString) return { success: false };

  try {
    const { error } = await supabase
      .from("users")
      .update({ data_compressed: compressedString })
      .eq("phone", normalizedPhone);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    console.error("Failed to update data_compressed:", err);
    return { success: false };
  }
}