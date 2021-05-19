import {
  ParagraphBlock,
  RichTextBase,
} from "@notionhq/client/build/src/api-types";
import React from "react";

interface Props {
  block: ParagraphBlock;
}

export function Paragraph(props: Props) {
  const { paragraph } = props.block;
  const { text } = paragraph;

  return (
    <>
      <p className="p-block">
        {text.map((text: RichTextBase) =>
          text.href ? (
            <a key={text.plain_text} href={text.href}>
              {text.plain_text}
            </a>
          ) : (
            <span key={text.plain_text}>{text.plain_text}</span>
          )
        )}
      </p>
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
