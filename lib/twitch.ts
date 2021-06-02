import { until } from "@open-draft/until";
import { formatDistanceToNow } from "date-fns";

const TWITCH_AUTH_URL = "https://id.twitch.tv/oauth2";
const TWITCH_API_URL = "https://api.twitch.tv/helix";

const REDIRECT_URI = encodeURIComponent(
  process.env.NODE_ENV === "production"
    ? "https://streams.ericadamski.dev/auth/callback/twitch"
    : "http://localhost:3000/auth/callback/twitch"
);

export interface TwitchUser {
  displayName: string;
  imageUrl: string;
  id: string;
  login: string;
}

export type AnonymousTwitchUser = Pick<TwitchUser, "id">;

export function getOAuthUrl(state?: string) {
  const scopes = ["user:read:email"];

  return `${TWITCH_AUTH_URL}/authorize?client_id=${
    process.env.TWITCH_CLIENT_ID
  }&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scopes.join(" ")}${
    state ? `&state=${state}` : ""
  }`;
}

export function getOAuthToken(code: string) {
  return fetch(
    `${TWITCH_AUTH_URL}/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${REDIRECT_URI}`,
    {
      method: "POST",
    }
  );
}

export function getUser(token: string) {
  return fetch(`${TWITCH_API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Client-Id": process.env.TWITCH_CLIENT_ID!,
    },
  }).then(async (response) => {
    if (response.ok) {
      const { data } = await response.json();
      const [{ displayName, offline_image_url, profile_image_url, id, login }] =
        data;

      return {
        displayName,
        imageUrl:
          profile_image_url.length > 0 ? profile_image_url : offline_image_url,
        id,
        login,
      };
    }
  });
}

export async function getAppAccessToken() {
  const scopes: string[] = [];

  const [error, response] = await until(() =>
    fetch(
      `${TWITCH_AUTH_URL}/token?client_id=${
        process.env.TWITCH_CLIENT_ID
      }&client_secret=${
        process.env.TWITCH_CLIENT_SECRET
      }&grant_type=client_credentials&scope=${encodeURIComponent(
        scopes.join(" ")
      )}`,
      {
        method: "POST",
      }
    )
  );

  if (error != null) {
    return undefined;
  }

  const { access_token, expires_in } = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string[];
    token_type: "bearer";
  };

  return { token: access_token, expiresIn: expires_in };
}

export interface StreamInfo {
  startedAt: Date;
  duration: string;
  viewerCount: number;
  title: string;
}

export async function getStreamInfo(
  token: string
): Promise<StreamInfo | undefined> {
  const userLogin = "ericadamski";
  const [error, response] = await until(() =>
    fetch(`${TWITCH_API_URL}/streams?user_login=${userLogin}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": process.env.TWITCH_CLIENT_ID!,
      },
    })
  );

  if (error != null) {
    return undefined;
  }

  const [responseParseError, responseData] = await until(() => response.json());

  if (responseParseError != null) {
    return undefined;
  }

  const [streamInfo] = responseData.data;

  if (streamInfo == null) {
    return undefined;
  }

  const startedAt = new Date(streamInfo.started_at);

  return {
    startedAt,
    duration: formatDistanceToNow(startedAt), // date-fns (live for 1 hour)
    viewerCount: streamInfo.viewer_count,
    title: streamInfo.title,
  };
}
