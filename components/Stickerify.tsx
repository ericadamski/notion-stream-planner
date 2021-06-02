import React from "react";
import { motion } from "framer-motion";

interface Props {
  sticker: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  /**
   * Always operate with rem.
   */
  size: number;
}

export function Stickerify(props: Props) {
  const Sticker = props.sticker;
  const size = `${props.size}rem`;
  const backgroundSize = `${props.size + 1}rem`;

  return (
    <>
      <motion.div
        className="sticker"
        style={{
          position: "relative",
          width: backgroundSize,
          height: backgroundSize,
          overflow: "hidden",
          padding: "1rem",
        }}
        whileHover={{
          rotate: [0, 20, -20, 20, 0],
          transition: { repeat: Infinity, duration: 0.7, repeatDelay: 0.4 },
        }}
      >
        <div className="sticker-top">
          <Sticker
            width={size}
            height={size}
            style={{
              filter: "drop-shadow(0 0 0.25rem rgba(0, 0, 0, .3))",
            }}
          />
        </div>
        <div className="sticker-background">
          <Sticker
            width={backgroundSize}
            height={backgroundSize}
            style={{
              filter: "drop-shadow(3px 3px 0.5rem rgba(0, 0, 0, .2))",
            }}
          />
        </div>
      </motion.div>
      <style jsx>{`
        .sticker-top {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -45%);
          z-index: 1;
        }
      `}</style>
      <style jsx global>
        {`
          .sticker-background path {
            fill: #fff;
          }
        `}
      </style>
    </>
  );
}
