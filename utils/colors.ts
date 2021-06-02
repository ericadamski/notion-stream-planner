import { hashString } from "./hashString";

type AvailableCSSVarColor =
  | "--sky-blue-crayola"
  | "--celeste"
  | "--mint-cream"
  | "--piggy-pink"
  | "--cotton-candy"
  | "--mountbatten-pink"
  | "--light-coral"
  | "--middle-blue-purple"
  | "--liberty"
  | "--cerise";

const COLORS = [
  "--sky-blue-crayola",
  "--celeste",
  "--mint-cream",
  "--piggy-pink",
  "--cotton-candy",
  "--mountbatten-pink",
  "--light-coral",
  "--middle-blue-purple",
  "--liberty",
  "--cerise",
] as const;

type CSSVarColorHex =
  | "#7bdff2"
  | "#b2f7ef"
  | "#eff7f6"
  | "#f7d6e0"
  | "#f2b5d4"
  | "#93748a"
  | "#ef767a"
  | "#7d7abc"
  | "#6457a6"
  | "#db2763";

const COLOR_HEXS = [
  "#7bdff2",
  "#b2f7ef",
  "#eff7f6",
  "#f7d6e0",
  "#f2b5d4",
  "#93748a",
  "#ef767a",
  "#7d7abc",
  "#6457a6",
  "#db2763",
] as const;

const colorToHexMap = new Map<AvailableCSSVarColor, CSSVarColorHex>(
  COLORS.map((color, idx) => [color, COLOR_HEXS[idx]])
);

export function getRandomCSSVarColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function getHexFromCSSVarColor(c: AvailableCSSVarColor) {
  return colorToHexMap.get(c) ?? getRandomCSSVarColor();
}

export function getCSSVarColorForString(id: string) {
  return COLORS[Math.abs(hashString(id) % COLORS.length)];
}
