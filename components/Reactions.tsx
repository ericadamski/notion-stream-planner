import React, {
  MouseEvent,
  useState,
  useRef,
  useEffect,
  useContext,
} from "react";
import Picker, { IEmojiData } from "emoji-picker-react";
import { motion } from "framer-motion";

import { useOnClickOutside } from "hooks/useOnClickOutside";
import { publish } from "lib/ably";
import { PointSystem } from "lib/points";
import { PointContext } from "context/Points";

const DEFAULT_EMOJIS = ["🚀", "🤣", "🤩", "🥳", "💩", "💯"];

const EMOJI_LS_KEY = "customEmojiReactions";

function getCustomEmojiList() {
  try {
    const emojis = JSON.parse(localStorage.getItem(EMOJI_LS_KEY) ?? "");

    return emojis;
  } catch (error) {}
}

export function Reactions() {
  const { instance } = useContext(PointContext);
  const emojiPickerRef = useRef<HTMLLIElement>(null);
  const [emojis, setEmojis] = useState<string[]>(
    getCustomEmojiList() ?? DEFAULT_EMOJIS
  );
  const [pickingCustomEmoji, setPickingCustomEmoji] = useState<boolean>(false);
  useOnClickOutside(emojiPickerRef, () => setPickingCustomEmoji(false));

  const handleEmojiClick = (emoji: string) => {
    instance?.addPoints(PointSystem.REACTION_CLICK);
    publish("emoji", { emoji });
  };

  useEffect(() => {
    localStorage.setItem(EMOJI_LS_KEY, JSON.stringify(emojis));
  }, [emojis]);

  useEffect(() => {}, []);

  return (
    <>
      <div className="reactions">
        <ul className="reactions__emoji-list">
          <li style={{ position: "relative" }} ref={emojiPickerRef}>
            {pickingCustomEmoji && (
              <Picker
                native
                pickerStyle={{ position: "absolute", zIndex: "100" }}
                onEmojiClick={(_event: MouseEvent, { emoji }: IEmojiData) => {
                  handleEmojiClick(emoji);

                  setEmojis((current) => {
                    const copy = current.slice(-DEFAULT_EMOJIS.length);
                    copy.push(emoji);

                    return Array.from(new Set(copy));
                  });

                  setPickingCustomEmoji(false);
                }}
              />
            )}
            <button
              className="emoji-list__button"
              onClick={() => setPickingCustomEmoji(true)}
            >
              custom
            </button>
          </li>
          {emojis.map((emoji) => {
            return (
              <li key={emoji}>
                <motion.button
                  style={{
                    appearance: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "transparent",
                    border: "none",
                    width: "5rem",
                    height: "5rem",
                  }}
                  onClick={() => handleEmojiClick(emoji)}
                  whileTap={{
                    scale: 0.8,
                  }}
                  whileHover={{
                    scale: [1.1, 0.9, 1.1],
                    transition: { repeat: Infinity },
                  }}
                >
                  <span
                    role="img"
                    style={{ userSelect: "none", fontSize: "4rem" }}
                  >
                    {emoji}
                  </span>
                </motion.button>
              </li>
            );
          })}
        </ul>
      </div>
      <style jsx>{`
        .reactions {
          padding-top: 2rem;
        }

        .reactions__emoji-list {
          display: flex;
          width: 100%;
          justify-content: space-between;
          flex-wrap: wrap;
          margin: 0;
          padding: 0;
          list-style: none;
        }
      `}</style>
    </>
  );
}
