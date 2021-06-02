import { until } from "@open-draft/until";
import React from "react";
import styled from "styled-components";
import { RoomServiceProvider } from "@roomservice/react";

import { AnonymousTwitchUser } from "lib/twitch";
import { useUser } from "hooks/useUser";
import { Cursors } from "./Cursors";
import { Pong } from "./Pong";

async function authRoomService(params: {
  room: string;
  ctx: {
    user: AnonymousTwitchUser;
  };
}) {
  const [requestError, response] = await until(() =>
    fetch(`https://twext-rti.vercel.app/api/room-service`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room: params.room,
        user: params.ctx.user,
      }),
    })
  );

  if (requestError != null || !response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized!");
    }

    if (response.status !== 200) {
      throw await response.text();
    }
  }

  const [parseError, data] = await until(() => response.json());

  if (parseError != null || data == null) {
    throw new Error("Unable to connect to room");
  }

  return {
    user: data.user,
    resources: data.resources,
    token: data.token,
  };
}

const channelId = "460284418";

export function MousePad() {
  const user = useUser();

  return (
    <RoomServiceProvider
      online={user?.id != null}
      clientParameters={{
        auth: authRoomService,
        ctx: { user },
      }}
    >
      <Pong channelId={channelId} />
      <Overlay>
        <Cursors channelId={channelId} />
      </Overlay>
    </RoomServiceProvider>
  );
}

const Overlay = styled.div`
  position: fixed;
  background: transparent;
  width: 100vw;
  height: 100vh;
`;
