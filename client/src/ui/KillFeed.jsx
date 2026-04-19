import { useMemo } from "react";

export default function KillFeed({ killFeed, myId }) {
  const visibleKillFeed = useMemo(() => {
    const now = Date.now();
    return killFeed.filter((entry) => now - entry.time < 3000).reverse();
  }, [killFeed]);

  return (
    <div className="killfeed">
      {visibleKillFeed.map((entry, index) => {
        const isMine = entry.killerId === myId;
        const killedMe = entry.victimId === myId;

        return (
          <div
            key={entry.id}
            className={`killfeed-entry ${isMine ? "mine" : ""} ${
              killedMe ? "killed-me" : ""
            }`}
            style={{
              opacity: 1 - index * 0.08,
              transform: `translateY(${index * 2}px)`,
            }}
          >
            <span className={isMine ? "killfeed-killer mine-text" : "killfeed-killer"}>
              {entry.killerName}
            </span>{" "}
            eliminated{" "}
            <span className={killedMe ? "killfeed-victim death-text" : "killfeed-victim"}>
              {entry.victimName}
            </span>
          </div>
        );
      })}
    </div>
  );
}