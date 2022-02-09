import { NextApiRequest, NextApiResponse } from "next";
import { publish } from "lib/ably";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  await publish("hotdog", { tick: Date.now() }, "messup-eric");

  res.end();
};
