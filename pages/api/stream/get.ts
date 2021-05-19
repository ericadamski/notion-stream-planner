import type { NextApiRequest, NextApiResponse } from "next";

import * as Notion from "lib/notion";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method != "GET") {
    return res.status(405).end();
  }

  const { pid } = req.query as { pid?: string };

  if (pid == null) {
    return res.status(400).end();
  }

  const blocks = await Notion.getPageContentById(pid);

  if (blocks == null) {
    return res.status(404).end();
  }

  res.json(blocks);
}
