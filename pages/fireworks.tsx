import { useState, useEffect, useRef } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";
import { CreateTypes } from "canvas-confetti";
import { motion } from "framer-motion";

import { subscribe } from "lib/ably";
import { useWindowSize } from "hooks/useWindowSize";

interface Reaction {
  emoji: string;
  id: string;
}

const MAX_EMOJIS = 20;
const MAX_EMOJI_RENDER = Array.from({ length: MAX_EMOJIS });

export default function FireworksPage() {
  const confettiCanvas = useRef<CreateTypes | null>();
  const fireworkTimer = useRef<number | NodeJS.Timer>();
  const fireworkIntervalTimer = useRef<number | NodeJS.Timer>();
  const [isFiring, setIsFiring] = useState<boolean>(false);
  const [emojis, setEmojis] = useState<Reaction[]>([]);
  const windowSize = useWindowSize();

  useEffect(() => {
    subscribe("fireworks", () => {
      if (fireworkTimer.current != null) {
        clearTimeout(fireworkTimer.current as number);
      }

      fireworkTimer.current = setTimeout(() => setIsFiring(false), 5000);

      setIsFiring(true);
    });

    subscribe("emoji", ({ id, data }) => {
      try {
        const { emoji } = JSON.parse(data);

        setEmojis((current) => {
          const copy = current.slice(-MAX_EMOJIS);
          copy.unshift({
            emoji,
            id,
          });

          return copy;
        });
      } catch {
        // lost the emoij
      }
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
        setTimeout(() => confetti?.reset(), 3000);
        if (fireworkIntervalTimer.current != null) {
          clearInterval(fireworkIntervalTimer.current as number);
        }
      }
    }
  }, [isFiring]);

  return (
    <>
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
      <div style={{ height: "100vh" }}>
        {MAX_EMOJI_RENDER.map((_, idx) => {
          const reaction = emojis[idx] ?? {};
          const randomEndX = Math.random() * (windowSize?.width ?? 0) + 100;

          return (
            <motion.div
              key={reaction.id}
              animate={{ x: -randomEndX, y: "-100vh" }}
              style={{
                position: "absolute",
                bottom: 0,
                right: 150,
              }}
              transition={{ duration: Math.random() }}
            >
              <span role="img" style={{ fontSize: "6rem" }}>
                {reaction.emoji}
              </span>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
