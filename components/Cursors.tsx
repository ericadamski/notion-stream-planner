import React, { useRef, useState, useCallback, useEffect } from "react";
import { MapClient, useMap } from "@roomservice/react";
import styled from "styled-components";
import { AnimatePresence } from "framer-motion";
import ms from "ms";

import { useUserCursor } from "hooks/useUserCursor";
import { Avatar, UserCursor } from "./Avatar";
import { Subject } from "rxjs";
import { throttleTime } from "rxjs/operators";
import { useWindowSize } from "hooks/useWindowSize";
import { useUser } from "hooks/useUser";

interface Props {
  channelId: string;
}

export function Cursors(props: Props) {
  const updateRemoteCursorPositionSubject = useRef<
    Subject<{
      data: UserCursor;
      map: MapClient<{ [userId: string]: UserCursor }>;
    }>
  >(new Subject());
  const windowDimensions = useWindowSize();
  const user = useUser();
  const [clicking, setClicking] = useState<boolean>(false);
  const [mousePosition, hideMouse] = useUserCursor();
  const [cursors, cursorMap] = useMap<{ [userId: string]: UserCursor }>(
    props.channelId,
    "cursors"
  );

  const handleRemoveCursor = useCallback(
    (id: string) => {
      cursorMap?.delete(id);
    },
    [cursorMap]
  );

  const handleClick = useCallback(() => {
    setClicking(true);
    if (cursorMap && user != null) {
      cursorMap.set(user.id, {
        ...cursorMap.get(user.id)!,
        isClicking: true,
      });
    }
  }, [cursorMap, user]);

  const onClickAnimationFinish = useCallback(() => {
    setClicking(false);
    if (cursorMap && user != null && cursorMap.get(user.id)?.isClicking) {
      cursorMap.set(user.id, {
        ...cursorMap.get(user.id)!,
        isClicking: false,
      });
    }
  }, [cursorMap, user]);

  useEffect(() => {
    if (user != null) {
      if (hideMouse) {
        cursorMap?.delete(user.id);
      } else {
        if (cursorMap != null) {
          setClicking(false);
          updateRemoteCursorPositionSubject.current.next({
            map: cursorMap,
            data: {
              user,
              position: mousePosition,
              dimensions: {
                w: windowDimensions.width ?? 0,
                h: windowDimensions.height ?? 0,
              },
              lastChange: Date.now(),
              isClicking: false,
            },
          });
        }
      }

      const handler = () => handleRemoveCursor(user.id);
      window.addEventListener("beforeunload", handler);

      return () => window.removeEventListener("beforeunload", handler);
    }
  }, [user?.id, mousePosition, hideMouse, windowDimensions]);

  useEffect(() => {
    const sub = updateRemoteCursorPositionSubject.current
      .pipe(throttleTime(200))
      .subscribe(({ data, map }) => map.set(data.user.id, data));

    return () => sub.unsubscribe();
  }, []);

  return (
    <MousePad onMouseDown={handleClick}>
      {user && (
        <AnimatePresence>
          {/* My cursor avatar */}
          {!hideMouse && (
            <Avatar
              channelId={props.channelId}
              user={user}
              isClicking={Boolean(clicking)}
              position={mousePosition}
              onClickAnimationFinish={onClickAnimationFinish}
            />
          )}
          {/* render the cursors */}
          {cursorMap?.keys.map((userId) => {
            // Don't render my own.
            if (userId === user.id) return null;

            const {
              isClicking,
              user: cursorUser,
              lastChange,
            } = cursors[userId];

            if (lastChange == null || Date.now() - lastChange > ms("30s")) {
              handleRemoveCursor(userId as string);

              return null;
            }

            return (
              <Avatar
                key={userId}
                channelId={props.channelId}
                showCursor
                isClicking={isClicking}
                user={cursorUser}
              />
            );
          })}
        </AnimatePresence>
      )}
    </MousePad>
  );
}

const MousePad = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: transparent;
  cursor: none;
`;
