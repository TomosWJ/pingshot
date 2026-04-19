import { useEffect, useMemo, useRef, useState } from "react";

const WIDTH = 1000;
const HEIGHT = 700;
const STORAGE_KEY = "pingshot_name";

export default function App() {
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const playersRef = useRef([]);
  const bulletsRef = useRef([]);

  const [players, setPlayers] = useState([]);
  const [myId, setMyId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  const [nameInput, setNameInput] = useState(
    localStorage.getItem(STORAGE_KEY) || ""
  );

  const inputRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    angle: 0,
    shoot: false,
  });

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001");
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "welcome") {
        setMyId(msg.id);
      }

      if (msg.type === "snapshot") {
        playersRef.current = msg.players || [];
        bulletsRef.current = msg.bullets || [];
        setPlayers(msg.players || []);
      }
    };

    socket.onclose = () => {
      setConnected(false);
      setJoined(false);
    };

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (!joined) return;

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === "w") inputRef.current.up = true;
      if (key === "s") inputRef.current.down = true;
      if (key === "a") inputRef.current.left = true;
      if (key === "d") inputRef.current.right = true;
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === "w") inputRef.current.up = false;
      if (key === "s") inputRef.current.down = false;
      if (key === "a") inputRef.current.left = false;
      if (key === "d") inputRef.current.right = false;
    };

    const handleMouseDown = () => {
      inputRef.current.shoot = true;
    };

    const handleMouseUp = () => {
      inputRef.current.shoot = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [joined]);

  useEffect(() => {
    if (!joined) return;

    const handleMouseMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * WIDTH;
      const mouseY = ((e.clientY - rect.top) / rect.height) * HEIGHT;

      const me = playersRef.current.find((p) => p.id === myId);
      if (!me) return;

      const dx = mouseX - me.x;
      const dy = mouseY - me.y;

      inputRef.current.angle = Math.atan2(dy, dx);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [myId, joined]);

  useEffect(() => {
    if (!joined) return;

    const interval = setInterval(() => {
      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) return;

      socket.send(
        JSON.stringify({
          type: "input",
          ...inputRef.current,
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [joined]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = "#0f1115";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.strokeStyle = "#2a2f3a";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, WIDTH, HEIGHT);

      for (const bullet of bulletsRef.current) {
        ctx.fillStyle = "#ff6767";
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const player of playersRef.current) {
        if (!player.alive) continue;

        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(
          player.x + Math.cos(player.angle) * 24,
          player.y + Math.sin(player.angle) * 24
        );
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(player.name, player.x, player.y - 24);

        if (player.id === myId) {
          ctx.strokeStyle = "#ffd166";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(player.x, player.y, 19, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [myId]);

  const me = players.find((p) => p.id === myId) || null;

  const leaderboard = useMemo(() => {
    return [...players].sort((a, b) => {
      if ((b.kills || 0) !== (a.kills || 0)) {
        return (b.kills || 0) - (a.kills || 0);
      }
      return (a.deaths || 0) - (b.deaths || 0);
    });
  }, [players]);

  const hpPercent = me ? Math.max(0, Math.min(100, me.hp || 0)) : 0;

  const handleJoin = (e) => {
    e.preventDefault();

    const trimmedName = nameInput.trim().slice(0, 16);
    const finalName = trimmedName || "Player";

    localStorage.setItem(STORAGE_KEY, finalName);

    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(
      JSON.stringify({
        type: "join",
        name: finalName,
      })
    );

    setJoined(true);
  };

  const canJoin = connected && nameInput.trim().length > 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#090b0f",
        color: "white",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ position: "relative", width: "min(1000px, 95vw)" }}>
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            border: "1px solid #2d3440",
            borderRadius: "14px",
            background: "#0f1115",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            padding: "14px 16px",
            background: "rgba(8, 10, 14, 0.82)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            minWidth: 210,
            backdropFilter: "blur(6px)",
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
            PingShot
          </div>
          <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 6 }}>
            {connected ? "Connected" : "Disconnected"}
          </div>
          <div style={{ fontSize: 14, opacity: 0.85 }}>
            {players.length} player{players.length === 1 ? "" : "s"} online
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            padding: "14px 16px",
            background: "rgba(8, 10, 14, 0.82)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            minWidth: 220,
            backdropFilter: "blur(6px)",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
            Scoreboard
          </div>

          {leaderboard.map((player, index) => (
            <div
              key={player.id}
              style={{
                display: "grid",
                gridTemplateColumns: "28px 1fr auto",
                gap: 8,
                alignItems: "center",
                padding: "6px 0",
                fontSize: 14,
                color: player.id === myId ? "#ffd166" : "white",
                opacity: player.alive ? 1 : 0.55,
                borderBottom:
                  index !== leaderboard.length - 1
                    ? "1px solid rgba(255,255,255,0.06)"
                    : "none",
              }}
            >
              <div>#{index + 1}</div>
              <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {player.name}
              </div>
              <div>
                {player.kills || 0}/{player.deaths || 0}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: 16,
            width: 260,
            padding: "14px 16px",
            background: "rgba(8, 10, 14, 0.82)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            backdropFilter: "blur(6px)",
          }}
        >
          <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>
            Health
          </div>
          <div
            style={{
              width: "100%",
              height: 14,
              background: "#232833",
              borderRadius: 999,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                width: `${hpPercent}%`,
                height: "100%",
                background: hpPercent > 30 ? "#58d68d" : "#ff6b6b",
                transition: "width 120ms linear",
              }}
            />
          </div>
          <div style={{ marginTop: 8, fontSize: 14, opacity: 0.9 }}>
            {me ? `${me.hp} HP` : "--"}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            padding: "14px 16px",
            background: "rgba(8, 10, 14, 0.82)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            fontSize: 14,
            lineHeight: 1.5,
            backdropFilter: "blur(6px)",
          }}
        >
          <div><strong>Move:</strong> WASD</div>
          <div><strong>Aim:</strong> Mouse</div>
          <div><strong>Shoot:</strong> Hold click</div>
        </div>

        {!joined && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.45)",
              borderRadius: "14px",
            }}
          >
            <form
              onSubmit={handleJoin}
              style={{
                width: 360,
                maxWidth: "90%",
                background: "rgba(10,12,18,0.95)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "18px",
                padding: "24px",
                boxSizing: "border-box",
                textAlign: "center",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  marginBottom: 8,
                }}
              >
                PingShot
              </div>

              <div
                style={{
                  fontSize: 15,
                  opacity: 0.8,
                  marginBottom: 18,
                }}
              >
                Enter your name and jump in
              </div>

              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value.slice(0, 16))}
                placeholder="Your name"
                maxLength={16}
                autoFocus
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "#151923",
                  color: "white",
                  fontSize: 16,
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: 14,
                }}
              />

              <button
                type="submit"
                disabled={!canJoin}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "none",
                  background: canJoin ? "#ffd166" : "#5c6472",
                  color: "#111",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: canJoin ? "pointer" : "not-allowed",
                  transition: "transform 0.12s ease",
                }}
              >
                Play
              </button>

              <div
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  opacity: 0.65,
                }}
              >
                {connected ? "Server ready" : "Connecting to server..."}
              </div>
            </form>
          </div>
        )}

        {me && !me.alive && joined && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.35)",
              borderRadius: "14px",
            }}
          >
            <div
              style={{
                padding: "24px 30px",
                background: "rgba(10,12,18,0.92)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                textAlign: "center",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ fontSize: 34, fontWeight: 800, marginBottom: 8 }}>
                You Died
              </div>
              <div style={{ fontSize: 16, opacity: 0.85 }}>
                Respawning...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}