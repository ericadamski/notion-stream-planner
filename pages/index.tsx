import { isSameDay, differenceInDays } from "date-fns";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { partition } from "ramda";

import * as Notion from "lib/notion";

interface Props {
  pages: Notion.NotionPage[];
}

export default function Home({ pages }: Props) {
  const [completeOrLive, upcoming] = partition(
    ({ date }) => Boolean(date),
    pages
  );
  const [live, complete] = partition(
    ({ date }) =>
      date ? differenceInDays(new Date(date), new Date()) === 0 : false,
    completeOrLive
  );

  console.log(live, complete, upcoming);

  return (
    <>
      <div
        style={{ background: "#fff", borderRadius: "2rem", padding: "2rem" }}
      >
        <h1>Streams</h1>
        {live.length > 0 ? (
          <>
            <h2>Live</h2>
            <ul>
              {live.map((p) => (
                <li key={p.id}>
                  <Link href={`/stream/${p.id}`}>
                    <a>{p.title}</a>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {upcoming.length > 0 ? (
          <>
            <h2>Upcoming streams</h2>
            <ul>
              {upcoming.map((p) => (
                <li key={p.id}>
                  <Link href={`/stream/${p.id}`}>
                    <a>{p.title}</a>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {complete.length > 0 ? (
          <>
            <h2>Complete</h2>
            <ul>
              {complete.map((p) => (
                <li key={p.id}>
                  <Link href={`/stream/${p.id}`}>
                    <a>{p.title}</a>
                  </Link>
                  <p>completed on {p.date}</p>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<
  Record<string, any>,
  Props & Record<string, any>
> = async function getServerSideProps() {
  return {
    props: { pages: await Notion.listPagesWithTitle() },
  };
};
