import { hashString } from "./hashString";

export function getUserImageFromId(id: string) {
  return `https://twext-rti.vercel.app/images/profile-${Math.abs(
    hashString(id) % 14
  )}.png`;
}
