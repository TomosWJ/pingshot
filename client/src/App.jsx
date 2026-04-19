import { useRef } from "react";
import "./styles.css";

import { HEIGHT, WIDTH } from "./game/constants";
import { useGameSocket } from "./game/useGameSocket";
import { usePlayerInput } from "./game/usePlayerInput";
import { useCanvasRenderer } from "./game/useCanvasRenderer";

import JoinOverlay from "./ui/JoinOverlay";
import TopLeftPanel from "./ui/TopLeftPanel";
import KillFeed from "./ui/KillFeed";
import Scoreboard from "./ui/Scoreboard";
import HealthPanel from "./ui/HealthPanel";
import ControlsPanel from "./ui/ControlsPanel";
import DeathOverlay from "./ui/DeathOverlay";

export default function App() {
  const canvasRef = useRef(null);

  const {
    players,
    playersRef,
    bulletsRef,
    killFeed,
    myId,
    me,
    connected,
    joined,
    joinGame,
    sendInput,
  } = useGameSocket();

  usePlayerInput({
    joined,
    myId,
    playersRef,
    canvasRef,
    sendInput,
  });

  useCanvasRenderer({
    canvasRef,
    playersRef,
    bulletsRef,
    myId,
  });

  return (
    <div className="app-shell">
      <div className="game-shell">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="game-canvas"
        />

        <TopLeftPanel connected={connected} playerCount={players.length} />
        <KillFeed killFeed={killFeed} myId={myId} />
        <Scoreboard players={players} myId={myId} />
        <HealthPanel me={me} />
        <ControlsPanel />

        {!joined && <JoinOverlay connected={connected} onJoin={joinGame} />}
        {me && !me.alive && joined && <DeathOverlay />}
      </div>
    </div>
  );
}