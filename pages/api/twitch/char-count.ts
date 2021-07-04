import { NextApiRequest, NextApiResponse } from "next";
import { publish, subscribe } from "lib/ably";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  publish("char-count-request", { tick: Date.now() }, "messup-eric");

  const { charCount } = await new Promise((resolve, reject) => {
    subscribe(
      "char-count-response",
      ({ data }) => {
        resolve(JSON.parse(data));
      },
      "messup-eric"
    );
  });

  res.end(`Eric has hit ${charCount ?? 69} keys today. FailFish`);
};
