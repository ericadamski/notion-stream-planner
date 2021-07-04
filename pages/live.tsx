import { useRef, useMemo, useEffect, useState } from "react";

import { publish, subscribe } from "lib/ably";

interface Gif {
  id: string;
  twitchUserLogin: string;
  gifUrl: string;
}

export default function LivePage() {
  // TODO: don't do this...
  const needsToRemove = useRef<string[]>([]);
  const [pendingGifs, setPendingGifs] = useState<Map<string, Gif>>(
    new Map<string, Gif>()
  );

  const removeGif = (id: string) => {
    console.log("gif");
    setPendingGifs((gifs) => {
      const updatedGifs = new Map<string, Gif>(gifs);

      updatedGifs.delete(id);

      return updatedGifs;
    });
  };

  const approveGif =
    (id: string, gifs: Map<string, Gif> = pendingGifs) =>
    () => {
      const g = gifs.get(id);

      if (g == null) return;

      publish("gif", { gif: g });
      removeGif(id);
    };

  const rejectGif = (id: string) => () => removeGif(id);

  useEffect(() => {
    subscribe("gif-pending", ({ id, data }) => {
      try {
        const { userLogin, url } = JSON.parse(data);
        needsToRemove.current.push(id);

        setPendingGifs((gifs) => {
          const updatedGifs = new Map<string, Gif>(gifs);

          updatedGifs.set(id, { twitchUserLogin: userLogin, gifUrl: url, id });

          return updatedGifs;
        });
      } catch {
        // Oops
      }
    });
  }, []);

  useEffect(() => {
    if (needsToRemove.current.length > 0) {
      for (const id of needsToRemove.current) {
        setTimeout(() => approveGif(id)(), 6000);
      }

      needsToRemove.current = [];
    }
  }, [pendingGifs]);

  const pendingGifList = useMemo(
    () => Array.from(pendingGifs.values()),
    [pendingGifs]
  );

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
      }}
    >
      <h2>Gif request</h2>
      <ul>
        {pendingGifList.map((gif) => (
          <li key={gif.id}>
            <p>{gif.twitchUserLogin}</p>
            <img src={gif.gifUrl} />
            <button onClick={approveGif(gif.id)}>approve</button>
            <button onClick={rejectGif(gif.id)}>reject</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
