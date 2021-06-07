import React, { memo, useMemo, useRef } from "react";
import { useMap } from "@roomservice/react";

import { UserCursor } from "./Avatar";
import { useUser } from "hooks/useUser";
import { RemoteAvatar } from "./RemoteAvatar";

interface Props {
  channelId: string;
}

export const RemoteCursors = memo<Props>(function RemoteCursors(props: Props) {
  const currentCursors = useRef<string[]>();
  const [cursors] = useMap<{ [userId: string]: UserCursor }>(
    props.channelId,
    "cursors"
  );

  const cursorIds = useMemo(() => {
    const ids = Object.keys(cursors);
    const currentSize = currentCursors.current?.length ?? 0;
    const updatedIds = new Set([...ids, ...(currentCursors.current ?? [])]);

    if (updatedIds.size === currentSize) {
      return currentCursors.current ?? [];
    }

    return (currentCursors.current = Array.from(updatedIds));
  }, [cursors]);

  return <Cursors channelId={props.channelId} cursorIds={cursorIds} />;
});

const Cursors = memo(
  function Cursors({
    channelId,
    cursorIds,
  }: {
    channelId: string;
    cursorIds: string[];
  }) {
    const user = useUser();

    return (
      <>
        {cursorIds.map((userId) => {
          // Don't render my own.
          if (userId === user?.id) return null;

          return (
            <RemoteAvatar
              key={userId}
              id={userId.toString()}
              channelId={channelId}
            />
          );
        })}
      </>
    );
  },
  (prev, next) => {
    return prev.cursorIds === next.cursorIds;
  }
);
