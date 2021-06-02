import { NextApiRequest, NextApiResponse } from "next";

import * as Notion from "lib/notion";
import { shouldNotifyForStream } from "lib/supabase";
import { announceNewStream } from "utils/announceNewStream";
import { formatDistance } from "date-fns";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const pages = await Notion.listPagesWithTitle();

  const needToNotify = await shouldNotifyForStream(
    pages
      .filter(({ isComplete, date }) => date.start != null && !isComplete)
      .map(({ id }) => id)
  );

  if (needToNotify.length > 0) {
    // N.B specifically picking off the first since we shouldn't announce more than once stream
    // at a time. This shouldn't really collid since we only schedule one at a time. In the case
    // where we have length > 1 then we will end up sending out the notification on the next
    // request that is at least 30 minutes away from our most recent announcement.
    const streamId = needToNotify[0];
    const streamInfo = pages.find(({ id }) => streamId === id);

    if (streamInfo != null) {
      announceNewStream(
        streamId,
        formatDistance(new Date(streamInfo.date.start!), new Date(), {
          includeSeconds: true,
        })
      );
    }
  }

  res.end();
};
