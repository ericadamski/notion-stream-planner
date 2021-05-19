import React from "react";

interface Props {
  amount: number;
  horizontal?: boolean;
}

export function Spacer(props: Props) {
  const amount = `${props.amount}rem`;

  return (
    <div
      style={{
        width: props.horizontal ? amount : "100%",
        height: !props.horizontal ? amount : "100%",
      }}
    />
  );
}
