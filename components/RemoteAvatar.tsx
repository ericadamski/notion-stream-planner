import React, { useMemo, memo } from "react";

import type { TwitchUser } from "lib/twitch";
import { useMap } from "@roomservice/react";
import { useWindowSize } from "hooks/useWindowSize";
import { getUserImageFromId } from "utils/getUserImageFromId";
import { Avatar, UserCursor } from "./Avatar";
import ms from "ms";

interface Props {
  id: string;
  channelId: string;
}

export const RemoteAvatar = memo(function RemoteAvatar(props: Props) {
  const hostDimensions = useWindowSize();
  const [cursors, cursorMap] = useMap<{ [userId: string]: UserCursor }>(
    props.channelId,
    "cursors"
  );
  const cursor = useMemo(() => cursors[props.id], [props.id, cursors]);
  const image = useMemo(
    () =>
      (cursor?.user as TwitchUser)?.imageUrl ?? getUserImageFromId(props.id),
    [props.id, cursor]
  );
  const position = useMemo(() => {
    const remotePosition = cursor?.position ?? { x: 0, y: 0 };
    const remoteDimensions = cursor?.dimensions ?? { w: 0, h: 0 };
    const wScale = (hostDimensions.width ?? 0) / remoteDimensions.w;
    const hScale = (hostDimensions.height ?? 0) / remoteDimensions.h;

    return {
      x: remotePosition.x * wScale + 16,
      y: remotePosition.y * hScale + 16,
    };
  }, [cursor, hostDimensions]);

  if (cursor == null) {
    return null;
  }

  if (cursor.lastChange == null || Date.now() - cursor.lastChange > ms("30s")) {
    cursorMap?.delete(cursor.user.id);

    return null;
  }

  return (
    <Avatar
      id={props.id}
      position={position}
      image={image}
      animationSpeed={0.2}
      isClicking={cursor.isClicking}
    />
  );
});
