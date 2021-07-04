import { NextApiRequest, NextApiResponse } from "next";
import { publish } from "lib/ably";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const { u, url } = req.query;

  publish("gif-pending", { userLogin: u, url });

  res.end("LUL");
};
