import { NextApiRequest, NextApiResponse } from "next";

import { getActiveTwitchToken } from "utils/getActiveTwitchToken";
import { getStreamInfo } from "lib/twitch";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const token = await getActiveTwitchToken();

  if (token == null) {
    return res.status(500).end();
  }

  res.json(await getStreamInfo(token));
};
