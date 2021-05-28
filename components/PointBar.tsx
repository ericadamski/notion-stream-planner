import { PointContext } from "context/Points";
import React, { useContext } from "react";

export function PointBar() {
  const { instance } = useContext(PointContext);

  return (
    <>
      <div className="point-bar">
        <div className="points">
          <span
            role="img"
            aria-label="Your points"
            style={{ fontSize: "2rem", marginRight: "0.5rem" }}
          >
            👉
          </span>{" "}
          {instance?.points}
        </div>
        <p>points</p>
      </div>
      <style jsx>{`
        .point-bar {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .point-bar p {
          margin: 0;
          opacity: 0.7;
        }

        .points {
          padding: 0 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }
      `}</style>
    </>
  );
}
