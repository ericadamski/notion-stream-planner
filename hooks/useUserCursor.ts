import { RefObject, useEffect, useState } from "react";
import { fromEvent } from "rxjs";
import {
  debounceTime,
  delay,
  switchMap,
  takeUntil,
  tap,
  throttleTime,
} from "rxjs/operators";

export interface Position {
  x: number;
  y: number;
}

export function useUserCursor(
  captureElement?: RefObject<HTMLElement>
): [mousePosition: Position, hideMouse: Boolean] {
  const [hideMouse, setHideMouse] = useState<boolean>(true);
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });

  useEffect(() => {
    let e: Document | HTMLElement | undefined | null =
      captureElement?.current ?? document;

    if (e != null) {
      const mouseEnter$ = fromEvent(e, "mouseenter");

      const mouseLeave$ = fromEvent(e, "mouseleave").pipe(
        delay(200),
        takeUntil(mouseEnter$),
        debounceTime(500),
        tap(() => setHideMouse(true))
      );

      const mouseMove$ = fromEvent(e, "mousemove").pipe(takeUntil(mouseLeave$));

      const mouse$ = mouseEnter$.pipe(
        tap(() => setHideMouse(false)),
        switchMap(() => mouseMove$)
      );

      const sub = mouse$.subscribe((event: Event) => {
        let [offsetTop, offsetLeft] = [0, 0];

        if (typeof (e as HTMLElement).getBoundingClientRect !== "undefined") {
          const { top, left } = (e as HTMLElement).getBoundingClientRect();
          offsetTop = top;
          offsetLeft = left;
        }

        setMousePosition({
          // @ts-ignore
          x: event.clientX - offsetLeft,
          // @ts-ignore
          y: event.clientY - offsetTop,
        });
      });

      return () => sub.unsubscribe();
    }
  }, []);

  return [mousePosition, hideMouse];
}
