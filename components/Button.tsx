import React, { ComponentProps } from "react";
import classnames from "classnames";
import { motion } from "framer-motion";
import { css } from "styled-jsx/css";

const { styles: buttonStyles, className: buttonClassName } = css.resolve`
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2px);
  border-radius: 0.25rem;
  border: 4px solid var(--black);
  color: var(--black);
  text-transform: uppercase;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  padding: 1rem;
`;

interface Props extends ComponentProps<typeof motion.button> {
  emoji?: string;
}

export function Button({ className, style, ...props }: Props) {
  return (
    <>
      <motion.button
        {...props}
        whileHover={{
          boxShadow: `0rem 0rem 0 0rem #272343`,
          x: 2,
          y: 2,
        }}
        className={classnames(buttonClassName, className)}
        style={{
          ...style,
          boxShadow: "0.25rem 0.325rem 0 0.0125rem #272343",
          cursor: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'  width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:24px;'><text y='50%'>${
            props.emoji ?? "🔗"
          }</text></svg>")
          16 0,
        auto`,
        }}
      />
      {buttonStyles}
    </>
  );
}
