import { useMemo, useState, useEffect, useRef } from "react";
import { Block, ToDoBlock } from "@notionhq/client/build/src/api-types";
import { GetStaticProps, GetStaticPaths } from "next";
import useSWR from "swr";
import { AnimatePresence, motion } from "framer-motion";
import classNames from "classnames";
import ms from "ms";

import * as Notion from "lib/notion";
import { Todo } from "components/Todo";
import { Paragraph } from "components/Paragraph";
import { partition } from "ramda";
import { Spacer } from "components/Spacer";
import { Tada } from "vectors/Tada";
import { publish } from "lib/ably";

interface Props {
  streamId?: string;
  content?: Block[];
}

export default function Stream({ streamId, content }: Props) {
  // N.B this is probably not the best way of tracing changs.
  // we could probably use replicache and only read the data from replicache but
  // use notion to push it.
  const lastCompletedIndex = useRef<number>();
  const descriptionTimer = useRef<NodeJS.Timeout>();
  const [descriptionVisible, setDescriptionVisible] = useState<boolean>(true);
  const { data } = useSWR<Block[]>(
    ["/api/stream/get", streamId],
    (route, pid) =>
      pid == null
        ? Promise.reject()
        : fetch(`${route}?pid=${pid}`).then((res) => res.json()),
    {
      initialData: content,
      refreshInterval: ms(process.env.NODE_ENV === "production" ? "2s" : "10m"),
    }
  );

  useEffect(() => {
    if (data != null) {
      const todos = data.filter(({ type }) => type === "to_do");

      const uncompleteIndex = (todos as ToDoBlock[]).findIndex(
        // @ts-ignore
        ({ to_do: { checked } }) => !checked
      );

      if (lastCompletedIndex.current == null) {
        // We have not loaded the site yet.
        lastCompletedIndex.current = uncompleteIndex - 1;
      }

      if (uncompleteIndex - 1 > lastCompletedIndex.current) {
        publish("fireworks", { fire: true });
      }

      lastCompletedIndex.current = uncompleteIndex - 1;
    }
  }, [data]);

  const { chunks, todos, progress, done, remainingTaskCount } = useMemo<{
    chunks: Block[];
    todos: Block[];
    progress: number;
    done: boolean;
    remainingTaskCount: number;
  }>(() => {
    if (data == null) {
      return {
        chunks: [],
        todos: [],
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
      return {
        chunks: rest,
        todos: [],
        progress: 1,
        done: true,
        remainingTaskCount: 0,
      };
    }

    const remainingTaskCount = todos.slice(uncompleteIndex).length;
    const progress = 1 - remainingTaskCount / todos.length;

    return {
      chunks: rest.filter(Boolean),
      todos: todos.slice(
        Math.max(0, uncompleteIndex - 1),
        uncompleteIndex + Math.max(3, Math.min(remainingTaskCount, 3))
      ),
      progress,
      remainingTaskCount,
      done: progress === 1,
    };
  }, [data]);

  useEffect(() => {
    descriptionTimer.current = setTimeout(
      () => setDescriptionVisible((active) => !active),
      ms("1m")
    );

    return () => {
      // @ts-ignore
      clearTimeout(descriptionTimer.current);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {descriptionVisible && (
          <motion.div
            layout
            initial={{ height: 0, paddingTop: "0rem", paddingBottom: "0rem" }}
            animate={{
              height: "auto",
              paddingTop: "1rem",
              paddingBottom: "1rem",
            }}
            exit={{ height: 0, paddingTop: "0rem", paddingBottom: "0rem" }}
            transition={{ duration: 1 }}
            style={{
              overflow: "hidden",
              paddingLeft: "1rem",
              paddingRight: "1rem",
              borderRadius: "1rem",
              color: "var(--action-text)",
              backgroundColor: "var(--header)",
            }}
            onAnimationComplete={() => {
              descriptionTimer.current = setTimeout(
                () => setDescriptionVisible((active) => !active),
                ms("2m")
              );
            }}
          >
            {chunks?.map((block) => {
              switch (block.type) {
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
          </motion.div>
        )}
      </AnimatePresence>

      <Spacer amount={2} />

      <div className="todo-list">
        {todos.map((todo, index, list) => (
          // N.B Active index is 1 so that 0 can be that last completed item and everything > 1
          // capped at 2 (Our list todos has at most 4 elements) is not active
          <Todo
            active={
              // @ts-ignore
              (index === 1 && list[0].to_do.checked) ||
              // @ts-ignore
              (index === 0 && !todo.to_do.checked)
            }
            block={todo as ToDoBlock}
            position={index}
            key={todo.id}
          />
        ))}
      </div>

      <style jsx>{`
        .progress-bar {
          width: 100%;
          appearance: none;
          height: 2.5rem;
          box-shadow: 0 0.5px 2.2px rgba(0, 0, 0, 0.02),
            0 1.3px 5.3px rgba(0, 0, 0, 0.028),
            0 2.4px 10px rgba(0, 0, 0, 0.035),
            0 4.2px 17.9px rgba(0, 0, 0, 0.042),
            0 7.9px 33.4px rgba(0, 0, 0, 0.05), 0 19px 80px rgba(0, 0, 0, 0.07);
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
    </>
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
