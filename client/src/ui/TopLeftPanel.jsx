export default function TopLeftPanel({ connected, playerCount }) {
  return (
    <div className="panel top-left-panel">
      <div className="panel-title large">PingShot</div>
      <div className="panel-text">{connected ? "Connected" : "Disconnected"}</div>
      <div className="panel-text">
        {playerCount} player{playerCount === 1 ? "" : "s"} online
      </div>
    </div>
  );
}