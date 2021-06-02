import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useMap } from "@roomservice/react";

import { useUserCursor } from "hooks/useUserCursor";
import { UserCursor } from "./Avatar";
import type { AnonymousTwitchUser, TwitchUser } from "lib/twitch";
import { useUser } from "hooks/useUser";

interface Props {
  channelId: string;
}

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

export function Pong(props: Props) {
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

  useEffect(() => {
    if (user != null && gameMap != null) {
      //   find the first game that is playing that I am player 2 or player 1 in.
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

  if (activeGameId == null || user == null) return null;

  //  TODO: if one user leaves the screen then they loose!

  const { player1, player2 } = games[activeGameId];
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
      <Ball />
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
