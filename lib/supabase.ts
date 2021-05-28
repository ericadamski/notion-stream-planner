import { until } from "@open-draft/until";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient;

const supabaseUrl = process.env.SUPABASE_API_URL ?? "";
const supabaseKey = process.env.SUPABASE_API_KEY ?? "";

export async function addNewTwitchToken(token: string, expires_in: number) {
  const base = getClientInstance();

  const [error] = await until(async () =>
    base
      .from<{ token: string; expires_at: Date | string }>("twitch_tokens")
      .insert([
        {
          token,
          expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
        },
      ])
  );

  return error == null;
}

export async function getLatestActiveTwitchToken() {
  const base = getClientInstance();

  const [error, record] = await until(async () =>
    base
      .from<{ token: string; expires_at: Date | string }>("twitch_tokens")
      .select("token")
      .gt("expires_at", new Date().toISOString())
      .single()
  );

  if (error != null || record?.data?.token == null) {
    return undefined;
  }

  return record.data.token;
}

function getClientInstance() {
  if (client == null) {
    client = createClient(supabaseUrl, supabaseKey);
  }

  return client;
}
