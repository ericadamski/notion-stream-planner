import { useState, useEffect, useRef } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";
import { CreateTypes } from "canvas-confetti";

import { subscribe } from "lib/ably";

export default function FireworksPage() {
  const confettiCanvas = useRef<CreateTypes | null>();
  const fireworkTimer = useRef<number | NodeJS.Timer>();
  const fireworkIntervalTimer = useRef<number | NodeJS.Timer>();
  const [isFiring, setIsFiring] = useState<boolean>(false);

  useEffect(() => {
    subscribe("fireworks", () => {
      if (fireworkTimer.current != null) {
        clearTimeout(fireworkTimer.current as number);
      }

      fireworkTimer.current = setTimeout(() => setIsFiring(false), 5000);

      setIsFiring(true);
    });

    subscribe("emojis", (data) => {
      console.log(data);
    }); // throttle, RxJS
  }, []);

  useEffect(() => {
    if (confettiCanvas.current != null) {
      const confetti = confettiCanvas.current;
      if (isFiring) {
        fireworkIntervalTimer.current = setInterval(() => {
          confetti({
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            zIndex: 0,
            particleCount: 150,
            origin: {
              x: randomInRange(0.1, 0.3),
              y: Math.random() - 0.2,
            },
          });
          confetti({
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            zIndex: 0,
            particleCount: 150,
            origin: {
              x: randomInRange(0.7, 0.9),
              y: Math.random() - 0.2,
            },
          });
        }, 400);
      } else {
        setTimeout(() => confetti.reset(), 3000);
        if (fireworkIntervalTimer.current != null) {
          clearInterval(fireworkIntervalTimer.current as number);
        }
      }
    }
  }, [isFiring]);

  return (
    <ReactCanvasConfetti
      refConfetti={(instance) => (confettiCanvas.current = instance)}
      style={{
        position: "fixed",
        pointerEvents: "none",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
      }}
    />
    // framer-motion
  );
}

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
