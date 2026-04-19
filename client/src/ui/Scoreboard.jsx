export default function Scoreboard({ players, myId }) {
  const leaderboard = [...players].sort((a, b) => {
    if ((b.kills || 0) !== (a.kills || 0)) {
      return (b.kills || 0) - (a.kills || 0);
    }
    return (a.deaths || 0) - (b.deaths || 0);
  });

  return (
    <div className="panel scoreboard-panel">
      <div className="panel-title">Scoreboard</div>

      {leaderboard.map((player, index) => (
        <div
          key={player.id}
          className={`score-row ${player.id === myId ? "is-me" : ""} ${
            !player.alive ? "is-dead" : ""
          }`}
        >
          <div>#{index + 1}</div>
          <div className="score-name">{player.name}</div>
          <div>
            {player.kills || 0}/{player.deaths || 0}
          </div>
        </div>
      ))}
    </div>
  );
}