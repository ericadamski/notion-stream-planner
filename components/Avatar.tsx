import React, { useMemo, memo } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

import type { Position } from "hooks/useUserCursor";
import type { AnonymousTwitchUser, TwitchUser } from "lib/twitch";
import { getCSSVarColorForString, getHexFromCSSVarColor } from "utils/colors";
import { getSVGCursor } from "utils/cursor";
import { hashString } from "utils/hashString";

export interface UserCursor {
  user: TwitchUser | AnonymousTwitchUser;
  position: Position;
  dimensions: {
    w: number;
    h: number;
  };
  isClicking?: boolean;
  lastChange?: number;
}

interface Props {
  id: string;
  image: string;
  position: Position;
  animationSpeed?: number;
  onClickAnimationFinish?: () => void;
  isClicking?: boolean;
}

export const Avatar = memo(
  function Avatar(props: Props) {
    const color = useMemo(() => getCSSVarColorForString(props.id), [props.id]);
    const cursor = useMemo(
      () => getSVGCursor(getHexFromCSSVarColor(color)),
      [color]
    );

    return (
      <Container
        layout="position"
        key={props.id}
        animate={{ ...props.position }}
        style={{ borderColor: `var(${color})` }}
        transition={{ duration: props.animationSpeed ?? 0 }}
      >
        <Cursor cursor={cursor}>
          {props.isClicking && (
            <Ripple
              style={{ backgroundColor: `var(${color})` }}
              animate={{ scale: [0, 6], opacity: [1, 0] }}
              transition={{ duration: 0.2 }}
              onAnimationComplete={() => {
                if (props.onClickAnimationFinish != null)
                  props.onClickAnimationFinish();
              }}
            />
          )}
        </Cursor>
        <ImageContainer>
          {props.image && <Image src={props.image} />}
        </ImageContainer>
      </Container>
    );
  },
  (prev, next) => {
    return (
      prev.position.x === next.position.x && prev.position.y === next.position.y
    );
  }
);

const Container = styled(motion.div)`
  user-select: none;
  position: absolute;
  border-radius: 50%;
  border: 4px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImageContainer = styled.div`
  overflow: hidden;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
`;

const Cursor = styled.div<{ cursor?: string }>`
  position: absolute;
  top: -1.25rem;
  left: -1.5rem;

  &::before {
    width: 2rem;
    height: 2rem;
    content: url("${({ cursor }) => cursor}");
  }
`;

const Ripple = styled(motion.div)`
  position: absolute;
  top: -0.25rem;
  left: 0rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  z-index: -1;
`;

const Image = styled.img`
  max-width: 100%;
`;
