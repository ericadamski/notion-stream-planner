import { NextApiRequest, NextApiResponse } from "next";
import { until } from "@open-draft/until";

import * as Notion from "lib/notion";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  until(() => fetch("https://streams.ericadamski.dev/api/stream/announce"));

  res.json(await Notion.listPagesWithTitle());
};
