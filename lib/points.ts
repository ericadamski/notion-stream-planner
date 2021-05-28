const POINT_STORAGE = "__streams.ericadamski.dev.points";

export class PointSystem {
  static REACTION_CLICK = 1;
  static VOTE = 3;
  static VIEW_DETAILS_CLICK = 5;
  static WATCH_LIVE = 7;

  private p: number = 0;

  constructor() {
    if (typeof window === "undefined") {
      // we are on the server.
      return;
    }

    this.p = +(localStorage.getItem(POINT_STORAGE) ?? "0");
  }

  get points() {
    return this.p;
  }

  addPoints(amount: number) {
    this.p += amount;
    localStorage.setItem(POINT_STORAGE, this.p.toString());
  }
}
