import OAuth from "oauth";

export function tweet(status: string): Promise<string | undefined> {
  /*
   * Source: https://gist.github.com/jaredpalmer/138f17a142d2d8770a1d752b0e00bd31
   */
  const twitter_application_consumer_key = process.env.TWITTER_API_KEY!;
  const twitter_application_secret = process.env.TWITTER_API_SECRET!;
  const twitter_user_access_token = process.env.TWITTER_ACCESS_TOKEN!;
  const twitter_user_secret = process.env.TWITTER_ACCESS_TOKEN_SECRET!;

  const oauth = new OAuth.OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    twitter_application_consumer_key,
    twitter_application_secret,
    "1.0A",
    null,
    "HMAC-SHA1"
  );

  const postBody = { status };

  return new Promise((resolve, reject) =>
    oauth.post(
      "https://api.twitter.com/1.1/statuses/update.json",
      twitter_user_access_token,
      twitter_user_secret,
      postBody,
      "", // post content type ?
      (err, body) => {
        if (err != null) {
          return reject(err);
        }

        try {
          const { id_str } = JSON.parse(body as string) as {
            id: number;
            id_str: string;
          };

          resolve(id_str);
        } catch {
          resolve(undefined);
        }
      }
    )
  );
}
