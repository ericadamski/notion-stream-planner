import React, { useEffect, useState, useRef, useCallback } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { MapClient, useMap } from "@roomservice/react";

import { useUserCursor } from "hooks/useUserCursor";
import { UserCursor } from "./Avatar";
import type { AnonymousTwitchUser, TwitchUser } from "lib/twitch";
import { useUser } from "hooks/useUser";
import { useWindowSize } from "hooks/useWindowSize";

interface Props {
  channelId: string;
}

export enum GameState {
  Invited = "invited",
  Playing = "playing",
}

const BALL_SPEED = 5;

export interface Game {
  invitedAt: number;
  state: GameState;
  ball: {
    x: number;
    y: number;
    direction: {
      x: number;
      y: number;
    };
  };
  player1: TwitchUser | AnonymousTwitchUser;
  player2: TwitchUser | AnonymousTwitchUser;
}

export function Pong(props: Props) {
  const hostWindowSize = useWindowSize();
  const animationRef = useRef<number>();
  const [activeGameId, setActiveGameId] = useState<string>();
  const [mousePosition] = useUserCursor();
  const user = useUser();
  const [cursors, cursorMap] = useMap<{ [userId: string]: UserCursor }>(
    props.channelId,
    "cursors"
  );
  const [games, gameMap] = useMap<{ [gameId: string]: Game }>(
    props.channelId,
    "games"
  );

  //   useEffect(() => {
  //     if (gameMap != null) {
  //       gameMap.keys.forEach((gameId) => gameMap.delete(gameId));
  //     }
  //   }, [gameMap]);

  useEffect(() => {
    if (user != null && gameMap != null) {
      const activeGameId = gameMap.keys.find((gameId) => {
        const game = gameMap.get(gameId)!;

        return (
          (game.player1.id === user.id || game.player2.id === user.id) &&
          game.state === GameState.Playing
        );
      });

      setActiveGameId(activeGameId?.toString());
    }
  }, [user, gameMap]);

  const moveBall = useCallback(
    (
      activeGameId: string,
      map: MapClient<{ [gameId: string]: Game }>,
      newDirection?: Game["ball"]["direction"]
    ) => {
      const game = map.get(activeGameId);

      if (game != null) {
        const direction = newDirection ?? game.ball.direction ?? { x: 1, y: 1 };

        map.set(activeGameId, {
          ...game,
          ball: {
            x: (game.ball?.x ?? 0) + BALL_SPEED * direction.x,
            y: (game.ball?.y ?? 0) + BALL_SPEED * direction.y,
            direction,
          },
        });
      }
    },
    []
  );

  const checkCollisions = useCallback(
    (
      activeGameId: string,
      map: MapClient<{ [gameId: string]: Game }>
    ): Game["ball"]["direction"] | undefined => {
      const game = map.get(activeGameId);

      if (user != null && game != null && game.ball != null) {
        const { player1, player2 } = game;
        const p1 = cursors[player1.id];
        const p2 = cursors[player2.id];

        if (p1 != null && p2 != null) {
          const [host, remote] = p1.user.id === user.id ? [p1, p2] : [p2, p1];
          const { x, y, direction } = game.ball;
          const nextX = x + direction.x * BALL_SPEED;
          const nextY = y + direction.y * BALL_SPEED;

          const remoteDimensions = remote.dimensions ?? { h: 0, w: 0 };
          const wScale = (host.dimensions.w ?? 0) / remoteDimensions.w;
          const hScale = (host.dimensions.h ?? 0) / remoteDimensions.h;

          if (nextX < 0 || nextX > host.dimensions.w * wScale) {
            //   this is a score
          }

          let newDirection = direction;

          if (nextY < 0 || nextY > host.dimensions.h * hScale) {
            newDirection.y *= -1;

            return newDirection;
          }

          const paddleSize = host.dimensions.h * 0.1;

          if (
            nextY >= host.position.y * hScale &&
            nextY <= host.position.y * hScale + paddleSize &&
            (nextX < 16 || host.dimensions.w * wScale - 16)
          ) {
            newDirection.x *= -1;
            newDirection.y *= -1;

            return newDirection;
          }

          if (
            nextY >= remote.position.y * hScale &&
            nextY <= remote.position.y * hScale + paddleSize &&
            (nextX < 16 || remote.dimensions.w * wScale - 16)
          ) {
            newDirection.x *= -1;
            newDirection.y *= -1;

            return newDirection;
          }
        }
      }
    },
    [cursors, user]
  );

  const play = useCallback(() => {
    animationRef.current = requestAnimationFrame(() => {
      if (gameMap != null && activeGameId != null) {
        const game = gameMap.get(activeGameId);

        if (game == null) stop();

        // check for points
        // check for colisions
        const direction = checkCollisions(activeGameId, gameMap);
        // move the ball
        moveBall(activeGameId, gameMap, direction);
        play();
      }
    });
  }, [gameMap, activeGameId, moveBall]);

  const stop = () =>
    animationRef.current != null && cancelAnimationFrame(animationRef.current);

  useEffect(() => {
    if (activeGameId != null) play();
    else {
      stop();
    }
  }, [activeGameId]);

  if (
    activeGameId == null ||
    user == null ||
    gameMap == null ||
    gameMap.get(activeGameId) == null
  )
    return null;

  //  TODO: if one user leaves the screen then they loose!

  const { player1, player2, ball } = gameMap.get(activeGameId) ?? {};

  if (player1 == null || player2 == null) return null;

  const p1y =
    player1.id === user.id
      ? mousePosition.y
      : cursors[player1.id]?.position.y ?? 0;
  const p2y =
    player2.id === user.id
      ? mousePosition.y
      : cursors[player2.id]?.position.y ?? 0;

  return (
    <GameBoard>
      <LeftPaddle style={{ y: p1y }} />
      <Ball style={{ x: ball?.x, y: ball?.y }} />
      <RightPaddle style={{ y: p2y }} />
    </GameBoard>
  );
}

const GameBoard = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  pointer-events: none;
`;

const Paddle = styled(motion.div)`
  position: absolute;
  width: 0.75rem;
  height: 10%;
  background-color: red;
`;

const LeftPaddle = styled(Paddle)`
  left: 1rem;
`;
const RightPaddle = styled(Paddle)`
  right: 1rem;
`;

const Ball = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2rem;
  height: 2rem;
  background: red;
`;
