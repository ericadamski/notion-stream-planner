import { ToDoBlock } from "@notionhq/client/build/src/api-types";
import classNames from "classnames";
import React from "react";
import { Spacer } from "./Spacer";

interface Props {
  block: ToDoBlock;
}

export function Todo(props: Props) {
  // @ts-ignore
  const { to_do } = props.block;
  const { checked, text } = to_do;

  return (
    <>
      <div className="todo-block">
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
          font-size: 1.75rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          padding: 0.5rem 0.25rem;
        }

        .todo-block__box.checked {
          background-color: blue;
          border-color: blue;
        }

        .todo-block__box {
          width: 1rem;
          height: 1rem;
          border-radius: 0.25rem;
          border: 2px solid black;
        }

        .todo-block p {
          margin: 0;
        }
      `}</style>
    </>
  );
}
