import React, { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistance } from "date-fns";
import { motion } from "framer-motion";

import type { NotionPage as NotionPageType } from "lib/notion";

interface Props {
  page: NotionPageType;
  onVoteClick?: () => void;
  voted: boolean;
  full?: boolean;
  ignoreVotes?: boolean;
}

export function NotionPage(props: Props) {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    if (props.onVoteClick != null) props.onVoteClick();
  };

  return (
    <>
      <Link href={`/stream/${props.page.id}`}>
        <motion.div whileHover="hovering" initial="initial">
          <a
            style={{
              display: "flex",
              flexWrap: "nowrap",
              cursor: `url("data:image/svg+xml,%3Csvg shape-rendering='geometricPrecision' xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='none'%3E%3Cg filter='url(%23filter0_d)'%3E%3Cpath fill='%23EF5DA8' d='M9.63 6.9a1 1 0 011.27-1.27l11.25 3.75a1 1 0 010 1.9l-4.68 1.56a1 1 0 00-.63.63l-1.56 4.68a1 1 0 01-1.9 0L9.63 6.9z'/%3E%3Cpath stroke='%23fff' stroke-width='1.5' d='M11.13 4.92a1.75 1.75 0 00-2.2 2.21l3.74 11.26a1.75 1.75 0 003.32 0l1.56-4.68a.25.25 0 01.16-.16L22.4 12a1.75 1.75 0 000-3.32L11.13 4.92z'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d' width='32.26' height='32.26' x='.08' y='.08' filterUnits='userSpaceOnUse'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'/%3E%3CfeOffset dy='4'/%3E%3CfeGaussianBlur stdDeviation='4'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0'/%3E%3CfeBlend in2='BackgroundImageFix' mode='normal' result='effect1_dropShadow'/%3E%3CfeBlend in='SourceGraphic' in2='effect1_dropShadow' mode='normal' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E")
              6 2,
            default`,
            }}
          >
            <div className="stream">
              <div className="stream__image">
                {props.page.imageUrl ? (
                  <Image width={500} height={400} src={props.page.imageUrl} />
                ) : null}
              </div>
              <div className="stream__image-blur">
                <div className="stream__content">
                  {!props.page.isComplete &&
                    (props.page.date.start != null ? (
                      <p style={{ opacity: 0.8, fontSize: "0.75rem" }}>
                        live in{" "}
                        {formatDistance(
                          new Date(props.page.date.start),
                          new Date(),
                          { includeSeconds: true }
                        )}
                      </p>
                    ) : (
                      <p style={{ opacity: 0.8, fontSize: "0.75rem" }}>
                        Not scheduled
                      </p>
                    ))}
                  <p>{props.page.title}</p>
                  <p className="small">
                    <span
                      role="img"
                      aria-label="+1"
                      style={{ fontSize: "1.25rem", marginRight: "0.25rem" }}
                    >
                      👍
                    </span>{" "}
                    {props.page.votes} vote
                    {props.page.votes !== 1 ? "s" : ""}
                  </p>
                  <div style={{ height: "1rem" }} />
                  {!props.page.isComplete && (
                    <button
                      className="stream__vote-btn"
                      onClick={handleClick}
                      style={{
                        cursor: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'  width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:24px;'><text y='50%'>👍</text></svg>") 16 0,auto`,
                      }}
                    >
                      {props.voted ? "un" : ""}vote
                    </button>
                  )}
                </div>
                {props.page.isComplete && (
                  <motion.div
                    variants={{
                      hovering: {
                        opacity: 0,
                      },
                      initial: {
                        opacity: 1,
                      },
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                  >
                    <div className="stream__complete">
                      <Image
                        width={400}
                        height={300}
                        src="/images/complete.png"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </a>
        </motion.div>
      </Link>
      <style jsx>{`
        .stream {
          position: relative;
          width: ${props.full ? "100%" : "300px"};
          height: 200px;
          border: 4px solid var(--black);
          box-shadow: 0.25rem 0.325rem 0 0.0125rem var(--black);
          overflow: hidden;
        }

        .stream__image {
          position: absolute;
          z-index: -1;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stream__image-blur {
          position: absolute;
          z-index: 1;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(242, 235, 226, 0.7);
          backdrop-filter: blur(2px);
        }

        .placeholder {
          position: relative;
        }

        .stream__content {
          height: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 0.5rem;
          align-items: center;
          justify-content: center;
          color: var(--black);
        }

        .stream__content p {
          text-align: center;
          margin: 0;
          font-size: 1.25rem;
        }

        .stream__content p.small {
          font-size: 1rem;
        }

        .stream__vote-btn {
          display: flex;
          align-items: center;
          appearance: none;
          background-color: var(--white);
          padding: 0.5rem 1.5rem;
          border-radius: 0.25rem;
          border: none;
        }

        .stream__complete {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </>
  );
}
