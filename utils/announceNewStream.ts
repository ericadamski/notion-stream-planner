import { until } from "@open-draft/until";
import dedent from "dedent";

import { tweet } from "./sendTweet";
import { storeStreamAnnouncement } from "lib/supabase";

const TWITTER_STATUS_BASE_URL = "https://twitter.com/zealigan/status";

export async function announceNewStream(streamId: string, startTime: string) {
  const [tweetError, tweetId] = await until(() =>
    tweet(
      dedent`
        I'll be 🎈LIVE streaming on #twitch 🔜 in ${startTime}!

        Head on over to https://streams.ericadamski.dev to see what I plan on doing.
      `
    )
  );

  if (tweetError != null) {
    // We can just swallow the error if we cannot tweet
    return;
  }

  return storeStreamAnnouncement({
    stream_page_id: streamId,
    sent_on: new Date().toISOString(),
    tweet_link:
      tweetId != null ? `${TWITTER_STATUS_BASE_URL}/${tweetId}` : undefined,
  });
}
