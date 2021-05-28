import { ToDoBlock } from "@notionhq/client/build/src/api-types";
import classNames from "classnames";
import React from "react";

import { Spacer } from "./Spacer";

interface Props {
  block: ToDoBlock;
  active?: boolean;
  position: number;
}

export function Todo(props: Props) {
  // @ts-ignore
  const { to_do } = props.block;
  const { checked, text } = to_do;

  return (
    <>
      <div
        className={classNames("todo-block", {
          active: Boolean(props.active),
          [`position-${props.position}`]: true,
        })}
      >
        <div className={classNames("todo-block__box", { checked })} />
        <Spacer horizontal amount={1} />{" "}
        <p
          style={
            checked
              ? { textDecoration: "line-through", opacity: 0.5 }
              : undefined
          }
        >
          {text[0].plain_text}
        </p>
      </div>
      <style jsx>{`
        .todo-block {
          font-size: 1.25rem;
          font-weight: bold;
          display: flex;
          padding: 1.75rem 1.5rem;
          background-color: var(--header);
          margin-top: 0.75rem;
          border-radius: 0.5rem;
          transform: scale(0.95);
          opacity: 0.75;
        }

        .todo-block.position-1 {
          margin-top: 0.25rem;
        }

        .todo-block.position-2 {
          margin-top: 0.125rem;
        }

        .todo-block.active {
          transform: scale(1);
          opacity: 1;
          margin-top: 0.15rem;
        }

        .todo-block__box.checked {
          background-color: var(--action);
          border-color: var(--action);
        }

        .todo-block__box {
          width: 1rem;
          height: 1rem;
          border-radius: 0.25rem;
          border: 2px solid var(--action);
          box-shadow: 0 0.5px 2.2px rgba(0, 0, 0, 0.02),
            0 1.3px 5.3px rgba(0, 0, 0, 0.028),
            0 2.4px 10px rgba(0, 0, 0, 0.035),
            0 4.2px 17.9px rgba(0, 0, 0, 0.042),
            0 7.9px 33.4px rgba(0, 0, 0, 0.05), 0 19px 80px rgba(0, 0, 0, 0.07);
        }

        .todo-block p {
          margin: 0;
          line-height: 1;
        }
      `}</style>
    </>
  );
}
