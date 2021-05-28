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
        borderRadius: "1rem",
        padding: "1rem",
        color: "var(--action-text)",
      }}
    >
      {data?.map((block, idx) => {
        switch (block.type) {
          case "to_do": {
            return <Todo position={idx} block={block} key={block.id} />;
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
