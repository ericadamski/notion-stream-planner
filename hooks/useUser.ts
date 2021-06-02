import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { AnonymousTwitchUser } from "lib/twitch";

const ID_NAME = "__streams.ericadamski.dev/id";

export function useUser(): AnonymousTwitchUser | undefined {
  const [id, setId] = useState<string>("");

  useEffect(() => {
    let id = localStorage.getItem(ID_NAME);

    if (id == null) {
      localStorage.setItem(ID_NAME, (id = uuidv4()));
    }

    setId(id);
  }, []);

  return id.length < 1 ? undefined : { id };
}
