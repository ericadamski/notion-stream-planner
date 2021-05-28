import { NextApiRequest, NextApiResponse } from "next";

import * as Notion from "lib/notion";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  res.json(await Notion.listPagesWithTitle());
};
