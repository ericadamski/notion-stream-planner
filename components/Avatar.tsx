import React, { useMemo, memo } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

import type { Position } from "hooks/useUserCursor";
import type { AnonymousTwitchUser, TwitchUser } from "lib/twitch";
import { getCSSVarColorForString, getHexFromCSSVarColor } from "utils/colors";
import { getSVGCursor } from "utils/cursor";
import { hashString } from "utils/hashString";
import { useMap } from "@roomservice/react";
import { useWindowSize } from "hooks/useWindowSize";

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
  channelId: string;
  position?: Position;
  user: TwitchUser | AnonymousTwitchUser;
  onClickAnimationFinish?: () => void;
  isClicking?: boolean;
  showCursor?: boolean;
}

export const Avatar = memo(function Avatar(props: Props) {
  const hostDimensions = useWindowSize();
  const [cursors] = useMap<{ [userId: string]: UserCursor }>(
    props.channelId,
    "cursors"
  );
  const color = useMemo(
    () => getCSSVarColorForString(props.user.id),
    [props.user]
  );
  const cursor = useMemo(
    () => getSVGCursor(getHexFromCSSVarColor(color)),
    [color]
  );
  const image = useMemo(
    () =>
      (props.user as TwitchUser).imageUrl ?? getRandomImageUrl(props.user.id),
    [props.user]
  );
  const myCursor = cursors[props.user.id];
  const position = useMemo(() => {
    if (props.position) return props.position;

    const remotePosition = myCursor?.position ?? { x: 0, y: 0 };
    const remoteDimensions = myCursor?.dimensions ?? { w: 0 };
    const wScale = (hostDimensions.width ?? 0) / remoteDimensions.w;

    return {
      x: remotePosition.x * wScale,
      y: remotePosition.y,
    };
  }, [props.position, myCursor, hostDimensions]);

  return (
    <Container
      key={props.user.id}
      animate={{
        x: position.x + 16,
        y: position.y + 16,
      }}
      style={{
        borderColor: `var(${color})`,
      }}
      transition={{ duration: props.showCursor ? 0.2 : 0 }}
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
      <ImageContainer>{image && <Image src={image} />}</ImageContainer>
    </Container>
  );
});

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

function getRandomImageUrl(id: string) {
  return `https://twext-rti.vercel.app/images/profile-${Math.abs(
    hashString(id) % 14
  )}.png`;
}
