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
  return getChannel(channelName).publish(topic, JSON.stringify(data));
}

function getChannel(channelName: string = DEFAULT_CHANNEL_NAME) {
  if (instance == null) {
    instance = new Ably.Realtime(process.env.NEXT_PUBLIC_ABLY_API_KEY!);
  }

  return instance.channels.get(channelName);
}
