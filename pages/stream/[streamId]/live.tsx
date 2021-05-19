import { useMemo } from "react";
import { Block, ToDoBlock } from "@notionhq/client/build/src/api-types";
import { GetStaticProps, GetStaticPaths } from "next";
import useSWR from "swr";

import * as Notion from "lib/notion";
import { Todo } from "components/Todo";
import { Paragraph } from "components/Paragraph";
import { partition } from "ramda";
import { Spacer } from "components/Spacer";
import { Tada } from "vectors/Tada";
import classNames from "classnames";

interface Props {
  streamId?: string;
  content?: Block[];
}

export default function Stream({ streamId, content }: Props) {
  const { data } = useSWR<Block[]>(
    ["/api/stream/get", streamId],
    (route, pid) =>
      pid == null
        ? Promise.reject()
        : fetch(`${route}?pid=${pid}`).then((res) => res.json()),
    {
      initialData: content,
      refreshInterval: 2000,
    }
  );

  const { chunks, progress, done, remainingTaskCount } = useMemo<{
    chunks: Block[];
    progress: number;
    done: boolean;
    remainingTaskCount: number;
  }>(() => {
    if (data == null) {
      return {
        chunks: [],
        progress: -Infinity,
        done: false,
        remainingTaskCount: -Infinity,
      };
    }

    const [todos, rest] = partition(({ type }) => type === "to_do", data);

    // find the first uncompleted todo, then pick thta plus 1 as the only ones to render.
    const uncompleteIndex = (todos as ToDoBlock[]).findIndex(
      // @ts-ignore
      ({ to_do: { checked } }) => !checked
    );

    if (todos.length < 1 || uncompleteIndex < 0) {
      return { chunks: rest, progress: 1, done: true, remainingTaskCount: 0 };
    }

    const remainingTaskCount = todos.slice(uncompleteIndex).length;
    const progress = 1 - remainingTaskCount / todos.length;

    return {
      chunks: [...rest, todos[uncompleteIndex - 1], todos[uncompleteIndex]],
      progress,
      remainingTaskCount,
      done: progress === 1,
    };
  }, [data]);

  return (
    <div
      style={{
        borderRadius: "1rem",
        padding: "1rem",
        color: "var(--action-text)",
        backgroundColor: "var(--header)",
        boxShadow: `0 2.8px 2.2px rgba(0, 0, 0, 0.02),
        0 6.7px 5.3px rgba(0, 0, 0, 0.028),
        0 12.5px 10px rgba(0, 0, 0, 0.035),
        0 22.3px 17.9px rgba(0, 0, 0, 0.042),
        0 41.8px 33.4px rgba(0, 0, 0, 0.05),
        0 100px 80px rgba(0, 0, 0, 0.07)`,
      }}
    >
      {chunks?.map((block) => {
        switch (block.type) {
          case "to_do": {
            return <Todo block={block} key={block.id} />;
          }
          case "paragraph": {
            return <Paragraph block={block} key={block.id} />;
          }
        }
      })}
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {done ? <Tada width="6rem" height="6rem" /> : null}
      </div>
      <div
        className="progress"
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "2rem",
        }}
      >
        <progress
          max={1}
          value={progress}
          className={classNames("progress-bar", { done })}
        />
        <Spacer amount={0.5} />
        <p
          style={{
            margin: 0,
            color: done ? "var(--bg)" : undefined,
            opacity: 0.8,
          }}
        >
          {done
            ? "🎉 We've done it!"
            : `${remainingTaskCount} thing${
                remainingTaskCount > 1 ? "s" : ""
              } left to
          do`}
        </p>
      </div>
      <style jsx>{`
        .progress-bar {
          width: 100%;
          appearance: none;
          height: 2.5rem;
          box-shadow: 0 2.8px 2.2px rgba(0, 0, 0, 0.02),
            0 6.7px 5.3px rgba(0, 0, 0, 0.028),
            0 12.5px 10px rgba(0, 0, 0, 0.035),
            0 22.3px 17.9px rgba(0, 0, 0, 0.042),
            0 41.8px 33.4px rgba(0, 0, 0, 0.05),
            0 100px 80px rgba(0, 0, 0, 0.07);
        }

        .progress-bar[value]::-webkit-progress-bar {
          background-color: rgba(255, 255, 255, 0.5);
          border-radius: 0.25rem;
          overflow: hidden;
        }

        .progress-bar.done[value]::-webkit-progress-value {
          background-color: var(--fg);
        }

        .progress-bar[value]::-webkit-progress-value {
          background-color: var(--action);
        }
      `}</style>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async function getStaticPaths() {
  const pages = await Notion.listPages();

  return {
    paths: pages.map((streamId) => ({ params: { streamId } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<
  Record<string, any>,
  Props & Record<string, any>
> = async function getStaticProps(context) {
  const { params } = context;

  if (params == null) {
    return { props: {} };
  }

  const { streamId } = params;

  if (streamId == null) {
    return { props: {} };
  }

  const pageContent = await Notion.getPageContentById(streamId);

  return {
    props: { streamId, content: pageContent },
    revalidate: 1,
  };
};
