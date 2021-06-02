import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useContext,
} from "react";
import { MapClient, useMap } from "@roomservice/react";
import styled from "styled-components";
import { AnimatePresence } from "framer-motion";
import ms from "ms";

import { useUserCursor } from "hooks/useUserCursor";
import { Avatar, UserCursor } from "./Avatar";
import { fromEvent, Subject } from "rxjs";
import { filter, tap, throttleTime } from "rxjs/operators";
import { useWindowSize } from "hooks/useWindowSize";
import { useUser } from "hooks/useUser";
import { ToastContext } from "context/Toast";
import { getUserImageFromId } from "utils/getUserImageFromId";
import type { AnonymousTwitchUser, TwitchUser } from "lib/twitch";
import { Pong } from "./Pong";

interface Props {
  channelId: string;
}

/**
 * <userId>:<userId>
 */
type GameId = string;

enum GameState {
  Invited = "invited",
  Playing = "playing",
}

interface Game {
  invitedAt: number;
  state: GameState;
  // position of the ball,
  // position of the paddles
  player1: TwitchUser | AnonymousTwitchUser;
  player2: TwitchUser | AnonymousTwitchUser;
}

export function Cursors(props: Props) {
  const { showToast } = useContext(ToastContext);
  const updateRemoteCursorPositionSubject = useRef<
    Subject<{
      data: UserCursor;
      map: MapClient<{ [userId: string]: UserCursor }>;
    }>
  >(new Subject());
  const windowDimensions = useWindowSize();
  const user = useUser();
  const [clicking, setClicking] = useState<boolean>(false);
  const [canStartGameWith, setCanStartGameWith] = useState<string>();
  const [hasPendingGameInvite, setPendingGameInvite] = useState<GameId>();
  const [mousePosition, hideMouse] = useUserCursor();
  const [cursors, cursorMap] = useMap<{ [userId: string]: UserCursor }>(
    props.channelId,
    "cursors"
  );
  const [games, gameMap] = useMap<{ [gameId: string]: Game }>(
    props.channelId,
    "games"
  );

  useEffect(() => {
    if (gameMap != null && user != null) {
      // TODO: just always take the first invite
      const inviteKey = gameMap.keys.find((gameId) => {
        const game = gameMap.get(gameId);

        if (game == null) return false;

        return game.state === GameState.Invited && game.player2.id === user.id;
      });

      if (inviteKey != null) {
        const invite = gameMap.get(inviteKey)!;
        setPendingGameInvite(inviteKey.toString());

        // TODO: if game invite is expried, end.

        const image =
          (invite.player1 as TwitchUser)?.imageUrl ??
          getUserImageFromId(invite.player1.id);

        showToast(
          <Toast>
            Press 'q' to accept invite from{" "}
            <span style={{ marginLeft: "0.25rem" }}>
              <img src={image} />
            </span>
          </Toast>
        );
      }
    }
  }, [user, gameMap, showToast]);

  // display accept/reject invite.
  // start/reject
  // if there is a pong game active render that rather than your cursor.

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
    const checkWithinGameRange = ({
      data,
      map,
    }: {
      data: UserCursor;
      map: MapClient<{ [userId: string]: UserCursor }>;
    }) => {
      let foundSomeone = false;

      for (const userId of map.keys) {
        const { position, dimensions } = map.get(userId) ?? {};

        if (position != null && userId !== data.user.id) {
          const remoteDimensions = dimensions ?? { h: 0, w: 0 };
          const wScale = (data.dimensions.w ?? 0) / remoteDimensions.w;
          const hScale = (data.dimensions.h ?? 0) / remoteDimensions.h;

          if (
            Math.abs(data.position.x - position.x * wScale) <= 50 &&
            Math.abs(data.position.y - position.y * hScale) <= 50
          ) {
            foundSomeone = true;
            setCanStartGameWith(userId.toString());
            break;
          }
        }
      }

      if (!foundSomeone) {
        setCanStartGameWith(undefined);
      }
    };

    const sub = updateRemoteCursorPositionSubject.current
      .pipe(tap(checkWithinGameRange), throttleTime(200))
      .subscribe(({ data, map }) => map.set(data.user.id, data));

    return () => {
      sub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const keydownSub = fromEvent<KeyboardEvent>(document, "keydown")
      .pipe(
        filter((event) => {
          const keyPressed = event.key.toLowerCase();

          console.log("esc", keyPressed);

          return keyPressed === "q";
        })
      )
      .subscribe((event) => {
        // TODO: reject invite?

        if (hasPendingGameInvite != null && gameMap != null) {
          gameMap.set(hasPendingGameInvite, {
            ...gameMap.get(hasPendingGameInvite)!,
            state: GameState.Playing,
          });

          setPendingGameInvite(undefined);
          showToast(null);
          return;
        }

        if (
          gameMap != null &&
          cursorMap != null &&
          user != null &&
          canStartGameWith != null
        ) {
          gameMap.set(`${user.id}:${canStartGameWith}`, {
            invitedAt: Date.now(),
            player1: user,
            player2: cursorMap.get(canStartGameWith)!.user,
            state: GameState.Invited,
          });
        }
      });

    return () => {
      keydownSub.unsubscribe();
    };
  }, [canStartGameWith, cursorMap, gameMap, user, showToast]);

  useEffect(() => {
    if (canStartGameWith != null && cursorMap != null) {
      const { user } = cursorMap.get(canStartGameWith) ?? {};
      const image =
        (user as TwitchUser)?.imageUrl ?? getUserImageFromId(canStartGameWith);

      showToast(
        <Toast>
          Press 'q' to start a game of 🏓 pong with{" "}
          <span>
            <img src={image} />
          </span>
        </Toast>
      );
    } else {
      showToast(null);
    }
  }, [cursorMap, canStartGameWith]);

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
            } = cursors[userId] ?? {};

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

const Toast = styled.div`
  display: flex;

  & span {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    overflow: hidden;
  }

  & span img {
    width: 100%;
  }
`;
