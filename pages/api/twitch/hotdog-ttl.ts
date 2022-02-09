import { NextApiRequest, NextApiResponse } from "next";
import { publish, subscribe } from "lib/ably";
import ms from "ms";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  await publish("hotdog-ttl", { tick: Date.now() }, "messup-eric");

  const { ttl } = await new Promise((resolve) => {
    subscribe(
      "hotdog-ttl-reponse",
      ({ data }) => {
        resolve(JSON.parse(data));
      },
      "messup-eric"
    );
  });

  res.end(`Only < ${ms(ttl ?? 0, { long: true })} of hotdogs 🌭`);
};
