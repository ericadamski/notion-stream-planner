import { until } from "@open-draft/until";
import { Client } from "@notionhq/client";
import {
  DatePropertyValue,
  NumberPropertyValue,
  TitlePropertyValue,
  URLPropertyValue,
} from "@notionhq/client/build/src/api-types";

let notionClient: Client;

export interface NotionPage {
  id: string;
  title: string;
  votes: number;
  date: {
    start: Date | string | number | null;
    end: Date | string | number | null;
  };
  isComplete: boolean;
  imageUrl?: string;
}

export async function listPages() {
  const [error, pagesResults] = await until(() =>
    instance().databases.query({
      database_id: process.env.NOTION_DB_ID!,
    })
  );

  if (error != null || pagesResults == null) {
    return [];
  }

  return pagesResults.results.map(({ id }) => id);
}

export async function updatePageVotes(pageId: string, votes: number) {
  return instance().pages.update({
    page_id: pageId,
    properties: {
      // @ts-ignore
      Votes: {
        number: votes,
      },
    },
  });
}

export async function listPagesWithTitle(): Promise<NotionPage[]> {
  const pageIds = await listPages();

  let pages: NotionPage[] = [];

  for (const id of pageIds) {
    const [pageGetError, pageData] = await until(() =>
      instance().pages.retrieve({ page_id: id })
    );

    if (pageGetError == null && pageData != null) {
      const {
        Name,
        "Stream date": streamDate,
        Votes,
        "Header Image": headerImage,
      } = pageData.properties;

      const { start, end } = (streamDate as DatePropertyValue)?.date ?? {
        start: null,
        end: null,
      };

      pages.push({
        id,
        title: (Name as TitlePropertyValue).title[0].plain_text,
        date: { start, end: end ?? null },
        votes: (Votes as NumberPropertyValue)?.number ?? 0,
        isComplete: end != null,
        imageUrl: (headerImage as URLPropertyValue)?.url ?? null,
      });
    }
  }

  return pages;
}

export async function getPageContentById(id: string) {
  const [pageGetError, pageData] = await until(() =>
    instance().pages.retrieve({ page_id: id })
  );

  if (pageGetError != null || pageData == null) {
    return;
  }

  const [rootBlockDataError, rootBlockData] = await until(() =>
    instance().blocks.children.list({ block_id: id })
  );

  if (rootBlockDataError != null || rootBlockData == null) {
    return;
  }

  return rootBlockData.results;
}

function instance() {
  if (notionClient == null) {
    notionClient = new Client({
      auth: process.env.NOTION_INTEGRATION_API_TOKEN,
    });
  }

  return notionClient;
}
