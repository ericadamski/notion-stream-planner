import { Block } from "@notionhq/client/build/src/api-types";
import { GetStaticProps, GetStaticPaths } from "next";
import useSWR from "swr";

import * as Notion from "lib/notion";
import { Todo } from "components/Todo";
import { Paragraph } from "components/Paragraph";

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

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.95)",
        borderRadius: "1rem",
        padding: "2rem",
      }}
    >
      <h1>What we're doing</h1>
      {data?.map((block) => {
        switch (block.type) {
          case "to_do": {
            return <Todo block={block} key={block.id} />;
          }
          case "paragraph": {
            return <Paragraph block={block} key={block.id} />;
          }
        }
      })}
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
