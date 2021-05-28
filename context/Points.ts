import { createContext } from "react";

import { PointSystem } from "lib/points";

export const PointContext = createContext<{ instance?: PointSystem | null }>(
  {}
);
