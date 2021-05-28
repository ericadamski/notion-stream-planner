import { NextApiRequest, NextApiResponse } from "next";

import * as Notion from "lib/notion";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { pageId, updatedVoteCount } = req.body as {
    pageId?: string;
    updatedVoteCount?: number;
    // TODO: use ops rather than hard numbers
    // op?: 'add' | 'remove'
  };

  if (pageId == null || updatedVoteCount == null) {
    return res.status(400).end();
  }

  // TODO: get the latest page vote count, apply the op

  await Notion.updatePageVotes(pageId, updatedVoteCount);

  // TODO: refetch and return the latest vote count
  res.end();
};
