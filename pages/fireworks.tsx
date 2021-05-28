import { useState, useEffect, useRef } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";
import { CreateTypes } from "canvas-confetti";
import { motion } from "framer-motion";
// @ts-ignore
import { EmojiProvider, Emoji } from "react-apple-emojis";
import emojiData from "react-apple-emojis/lib/data.json";

import { subscribe } from "lib/ably";

interface Reaction {
  emoji: string;
  id: string;
}

const MAX_EMOJI_RENDER = Array.from({ length: 60 });

export default function FireworksPage() {
  const confettiCanvas = useRef<CreateTypes | null>();
  const fireworkTimer = useRef<number | NodeJS.Timer>();
  const fireworkIntervalTimer = useRef<number | NodeJS.Timer>();
  const [isFiring, setIsFiring] = useState<boolean>(false);
  const [emojis, setEmojis] = useState<Reaction[]>([]);

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
          const copy = current.slice(-60);
          copy.push({
            emoji,
            id,
          });

          console.log({ copy });

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
        <EmojiProvider data={emojiData}>
          {MAX_EMOJI_RENDER.map((_, idx) => {
            const reaction = emojis[idx] ?? {};

            return (
              <motion.div
                key={idx}
                animate={{ x: 100, y: "0%" }}
                style={{ y: "100%" }}
                transition={{ duration: 3 }}
              >
                {reaction.emoji && (
                  <Emoji key={reaction.id} name={reaction.emoji} />
                )}
              </motion.div>
            );
          })}
        </EmojiProvider>
      </div>
    </>
  );
}

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
