import { useEffect, useRef, useState } from "react";
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
    recentHits,
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

  const [hitMarkerActive, setHitMarkerActive] = useState(false);
  const [damageFlashActive, setDamageFlashActive] = useState(false);
  const seenHitsRef = useRef(new Set());

  useEffect(() => {
    for (const hit of recentHits) {
      if (seenHitsRef.current.has(hit.id)) continue;

      seenHitsRef.current.add(hit.id);

      if (hit.attackerId === myId) {
        setHitMarkerActive(true);
        setTimeout(() => setHitMarkerActive(false), 120);
      }

      if (hit.victimId === myId) {
        setDamageFlashActive(true);
        setTimeout(() => setDamageFlashActive(false), 180);
      }
    }

    if (seenHitsRef.current.size > 100) {
      seenHitsRef.current = new Set(Array.from(seenHitsRef.current).slice(-50));
    }
  }, [recentHits, myId]);

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

        {hitMarkerActive && (
          <div className="hitmarker">
            <div className="hitmarker-line hitmarker-line-a" />
            <div className="hitmarker-line hitmarker-line-b" />
            <div className="hitmarker-line hitmarker-line-c" />
            <div className="hitmarker-line hitmarker-line-d" />
          </div>
        )}

        {damageFlashActive && <div className="damage-flash" />}

        {!joined && <JoinOverlay connected={connected} onJoin={joinGame} />}
        {me && !me.alive && joined && <DeathOverlay />}
      </div>
    </div>
  );
}