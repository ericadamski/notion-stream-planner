import { useContext, useState, useMemo } from "react";
import { compareDesc, formatDistance, isAfter } from "date-fns";
import { GetStaticProps } from "next";
import dynamic from "next/dynamic";
import { partition, sort } from "ramda";
import useSWR from "swr";
import { createEvent } from "ics";

import * as Notion from "lib/notion";
import { NotionPage } from "components/NotionPage";
import Image from "next/image";
import type { StreamInfo } from "lib/twitch";
import { PointBar } from "components/PointBar";
import { PointContext } from "context/Points";
import { PointSystem } from "lib/points";
import { Button } from "components/Button";

const Reactions = dynamic(
  async () => (await import("../components/Reactions")).Reactions,
  { ssr: false }
);

interface Props {
  pages: Notion.NotionPage[];
}

export default function Home({ pages }: Props) {
  const { instance } = useContext(PointContext);
  const { data, mutate } = useSWR<Notion.NotionPage[]>(
    "/api/notion/list-pages",
    (route) => fetch(route).then((r) => (r.ok ? r.json() : [])),
    { initialData: pages }
  );
  const { data: streamInfo } = useSWR<StreamInfo>(
    "/api/twitch/stream-info",
    (route): Promise<StreamInfo> =>
      fetch(route).then((r) => (r.ok ? r.json() : {})) as Promise<StreamInfo>
  );
  const [votes, setVotes] = useState<Map<string, number>>(
    new Map<string, number>()
  );
  const [completeOrLive, upcoming] = useMemo(
    () => partition(({ date }) => Boolean(date?.start), data || []),
    [data]
  );
  const [live, complete] = useMemo(
    () =>
      partition(
        ({ date, isComplete }) =>
          date?.start != null
            ? isAfter(new Date(), new Date(date.start)) && !isComplete
            : Boolean(isComplete),
        completeOrLive
      ),
    [completeOrLive]
  );
  const sortedUpcoming = useMemo(
    () =>
      sort((page1, page2) => {
        const compareDates = compareDesc(
          new Date(page1.date.start ?? 0),
          new Date(page2.date.start ?? 0)
        );
        const compareVotes = page1.votes < page2.votes ? 1 : -1;

        return compareDates || compareVotes;
      }, upcoming.concat(complete)),
    [upcoming, complete]
  );

  const handleLocalPageVoteUpdate = (pageId: string, votes: number) => {
    instance?.addPoints(PointSystem.VOTE);
    return mutate((currentPages) => {
      if (currentPages == null) return currentPages;

      const copy = [...currentPages];

      const pageToUpdate = copy.find((page) => page.id === pageId);

      if (pageToUpdate == null) return currentPages;

      pageToUpdate.votes = votes;

      return copy;
    }, true);
  };

  const handlePageVote = (pageId: string, currentVotes: number) => () => {
    const updatedVoteCount = Math.max(
      0,
      currentVotes + (votes.has(pageId) ? -1 : 1)
    );

    handleLocalPageVoteUpdate(pageId, updatedVoteCount);

    fetch("/api/notion/update-page-votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageId,
        updatedVoteCount,
        op: votes.has(pageId) ? "remove" : "add",
      }),
    });

    setVotes((v) => {
      const copy = new Map<string, number>(v.entries());

      if (copy.has(pageId)) {
        copy.delete(pageId);
      } else {
        copy.set(pageId, 1);
      }

      return copy;
    });
  };

  const nextStream = useMemo(() => {
    return sortedUpcoming.find(
      ({ isComplete, date }) => !isComplete && date.start != null
    );
  }, [sortedUpcoming]);
  const nextEventCalLink = useMemo(() => {
    if (nextStream != null) {
      const { start } = nextStream.date;
      const startTime = new Date(start!);

      const { value } = createEvent({
        start: [
          startTime.getFullYear(),
          startTime.getMonth() + 1,
          startTime.getDate(),
          startTime.getHours(),
          startTime.getMinutes(),
        ],
        startInputType: "local",
        duration: { hours: 1 },
        title: "Eric's streaming!",
        description: `Come watch me hack, build, chat or play some games. Check out what we will be doing in this stream here: https://streams.ericadamski.dev/stream/${nextStream.id}`,
        url: "https://twitch.tv/wikkidoo",
        status: "CONFIRMED",
        organizer: { name: "Eric", email: "er.adamski@gmail.com" },
      });

      if (value != null) {
        return `data:text/calendar;charset=utf8,${encodeURIComponent(value)}`;
      }
    }
  }, [nextStream]);

  return (
    <>
      <div style={{ padding: "2rem" }}>
        {/* <div className="header"> */}
        <div className="watch-now">
          <PointBar />
          <div style={{ width: "1rem" }} />
          <a
            href="https://twitch.tv/wikkidoo"
            onClick={() => instance?.addPoints(PointSystem.WATCH_LIVE)}
          >
            {live.length >= 1 ? "Watch now" : "Follow for updates"}
          </a>
        </div>
        {/* <div>
            <p
              style={{
                margin: 0,
                marginTop: "0.75rem",
                background: "var(--action)",
                width: 250,
                padding: "0.5rem",
                borderRadius: "0.25rem",
                textAlign: "center",
              }}
            >
              Get points by clicking stuff!
            </p>
          </div> */}
        {/* </div> */}
        <div style={{ height: "2rem" }} />
        <div className="streams-container">
          <h2
            className="streams-title"
            style={{ display: "flex", alignItems: "center" }}
          >
            <span
              style={{
                borderRadius: "50%",
                height: "0.5rem",
                width: "0.5rem",
                backgroundColor: live.length >= 1 ? "red" : "grey",
                marginRight: "0.5rem",
              }}
            />{" "}
            Live
          </h2>
          {live.length > 0 ? (
            <>
              <ul
                className="stream-list"
                style={{ gridTemplateColumns: "1fr" }}
              >
                {live.map((p) => (
                  <li key={p.id}>
                    <NotionPage
                      streamInfo={streamInfo}
                      full
                      ignoreVotes
                      page={p}
                      onVoteClick={handlePageVote(p.id, p.votes)}
                      voted={votes.has(p.id)}
                    />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="not-live">
              <p style={{ fontSize: "3rem" }}>😭</p>
              <p>We don't have a stream today</p>
              <div style={{ height: "1rem" }} />
              <p>
                Head below so you can vote on what I should stream next or take
                a loot at some recordings!
              </p>
              <Image width={550} height={500} src="/images/sleeping_cat.gif" />
            </div>
          )}
          {nextStream && (
            <>
              <p
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                I'm streaming in{" "}
                <span style={{ textDecoration: "underline" }}>
                  {formatDistance(
                    new Date(nextStream.date.start!),
                    new Date(),
                    {
                      includeSeconds: true,
                    }
                  ).toUpperCase()}
                </span>{" "}
                put that sh*t in your calendar so you don't miss it!
              </p>
              <div style={{ height: "2rem" }} />
              {nextEventCalLink != null && (
                <a href={nextEventCalLink}>
                  <Button style={{ width: "100%" }} emoji="📅">
                    <span style={{ marginRight: "0.5rem" }}>📅</span> Add to my
                    calendar
                  </Button>
                </a>
              )}
              <div style={{ height: "2rem" }} />
              <NotionPage
                full
                ignoreVotes
                page={nextStream}
                onVoteClick={handlePageVote(nextStream.id, nextStream.votes)}
                voted={votes.has(nextStream.id)}
              />
            </>
          )}
          {live.length > 0 && streamInfo != null && <Reactions />}
        </div>
        <div style={{ height: "2rem" }} />
        <div className="streams-container">
          <h2 className="streams-title">
            <span style={{ marginRight: "0.25rem" }}>📡</span> Streams
          </h2>
          <p>
            Vote on what I should do next! Click through to see details of each
            stream.
          </p>
          {sortedUpcoming.length > 0 ? (
            <ul className="stream-list">
              {sortedUpcoming.map((p) => {
                return (
                  <li key={p.id}>
                    <NotionPage
                      page={p}
                      onVoteClick={handlePageVote(p.id, p.votes)}
                      voted={votes.has(p.id)}
                    />
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
      <style jsx>{`
        .stream-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(332px, 1fr));
          grid-gap: 1rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .streams-container {
          position: relative;
          border: 4px solid var(--black);
          padding: 2rem;
        }

        .streams-title {
          position: absolute;
          background: var(--white);
          padding: 0 0.5rem;
          top: -2.5rem;
          left: 1rem;
        }

        .not-live {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .not-live p {
          margin: 0;
          font-size: 1.25rem;
          width: 320px;
        }

        .watch-now {
          display: flex;
          align-items: center;
          width: 100%;
          position: sticky;
          top: 1rem;
          z-index: 100;
          background-color: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(2px);
          border-radius: 0.25rem;
        }

        .watch-now a {
          box-shadow: 0.25rem 0.325rem 0 0.0125rem var(--black);
          width: 100%;
          padding: 1rem;
          border: 4px solid var(--black);
          text-decoration: none;
          color: var(--black);
          text-transform: uppercase;
          font-weight: bold;
          font-size: 1.5rem;
          cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'  width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:24px;'><text y='50%'>👀</text></svg>")
              16 0,
            auto; /*!emojicursor.app*/
        }
      `}</style>
    </>
  );
}

export const getStaticProps: GetStaticProps<
  Record<string, any>,
  Props & Record<string, any>
> = async function getStaticProps() {
  return {
    props: { pages: await Notion.listPagesWithTitle() },
    revalidate: 10,
  };
};
