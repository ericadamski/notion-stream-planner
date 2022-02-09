import Ably from "ably";

let instance: Ably.Realtime;

const DEFAULT_CHANNEL_NAME = "live-stream-realtime";

export function subscribe(
  topic: string,
  handler: Ably.Types.messageCallback<Ably.Types.Message>,
  channelName?: string
) {
  return getChannel(channelName).subscribe(topic, handler);
}

export function publish(topic: string, data: Object, channelName?: string) {
  return new Promise((resolve) =>
    getChannel(channelName).publish(topic, JSON.stringify(data), resolve)
  );
}

function getChannel(channelName: string = DEFAULT_CHANNEL_NAME) {
  if (instance == null) {
    instance = new Ably.Realtime(process.env.NEXT_PUBLIC_ABLY_API_KEY!);
  }

  if (instance.connection.state !== "connected") {
    instance.connect();
  }

  return instance.channels.get(channelName);
}
