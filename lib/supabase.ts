import { until } from "@open-draft/until";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import ms from "ms";

let client: SupabaseClient;

const APP_NAME = "steams.ericadamski.dev";
const supabaseUrl = process.env.SUPABASE_API_URL ?? "";
const supabaseKey = process.env.SUPABASE_API_KEY ?? "";

interface TwitchToken {
  id: number;
  token: string;
  expires_at: Date | string;
  app_name: string;
}

interface StreamAnnouncement {
  id: number;
  stream_page_id: string;
  sent_on: Date | string;
  tweet_link?: string;
}

export async function addNewTwitchToken(token: string, expires_in: number) {
  const base = getClientInstance();

  const [error] = await until(async () =>
    base.from<TwitchToken>("twitch_tokens").insert([
      {
        token,
        app_name: APP_NAME,
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
      .from<TwitchToken>("twitch_tokens")
      .select("token")
      .eq("app_name", APP_NAME)
      .gt("expires_at", new Date().toISOString())
      .single()
  );

  if (error != null || record?.data?.token == null) {
    return undefined;
  }

  return record.data.token;
}

/**
 * @param streamIds A list of Notion.NotionPage.id's to check if we have notified.
 * @return Notion.NotionPage.id[]
 * Sends back all of the page id's that have not been notified.
 */
export async function shouldNotifyForStream(
  streamIds: string[]
): Promise<string[]> {
  const base = getClientInstance();

  const [error, record] = await until(async () =>
    base
      .from<StreamAnnouncement>("stream_announcements")
      .select("stream_page_id")
      .in("stream_page_id", streamIds)
  );

  if (error != null) {
    // N.B Not sure this is the best choice. If we don't really know why there is an error
    // to be safe we shouldn't tweet.
    return [];
  }

  const [mostRecentError, mostRecentRecord] = await until(async () =>
    base
      .from<StreamAnnouncement>("stream_announcements")
      .select("sent_on")
      .gt("sent_on", new Date(Date.now() - ms("30m")).toISOString())
      .limit(1)
  );

  // N.B avoid sending more than 1 announcement every 30 minutes
  if (mostRecentError == null && (mostRecentRecord.data?.length ?? 0) > 0) {
    return [];
  }

  if (record.data?.length == 0 && streamIds.length > 0) {
    return streamIds;
  }

  return (
    record.data
      ?.filter(({ stream_page_id }) => !streamIds.includes(stream_page_id))
      .map(({ stream_page_id }) => stream_page_id) ?? []
  );
}

export async function storeStreamAnnouncement(
  announcement: Omit<StreamAnnouncement, "id">
): Promise<boolean> {
  const base = getClientInstance();

  const [error] = await until(async () =>
    base.from<StreamAnnouncement>("stream_announcements").insert([announcement])
  );

  if (error != null) {
    return false;
  }

  return true;
}

function getClientInstance() {
  if (client == null) {
    client = createClient(supabaseUrl, supabaseKey);
  }

  return client;
}
