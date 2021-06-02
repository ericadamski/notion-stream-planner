import { NextApiRequest, NextApiResponse } from "next";

import * as Notion from "lib/notion";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  fetch("https://streams.ericadamski.dev/api/stream/announce");

  res.json(await Notion.listPagesWithTitle());
};
