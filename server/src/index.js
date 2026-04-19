const WebSocket = require("ws");
const crypto = require("crypto");

const PORT = 3001;
const TICK_RATE = 20;

const WORLD_WIDTH = 1000;
const WORLD_HEIGHT = 700;

const PLAYER_SPEED = 220;
const BULLET_SPEED = 500;

const FIRE_COOLDOWN = 200;
const BULLET_LIFE = 1;

const PLAYER_RADIUS = 15;
const BULLET_RADIUS = 4;

const MAX_HP = 100;
const DAMAGE = 25;
const RESPAWN_TIME = 1000;

const wss = new WebSocket.Server({ port: PORT });

const players = new Map();
const bullets = [];

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function randomSpawn() {
  return {
    x: 100 + Math.random() * (WORLD_WIDTH - 200),
    y: 100 + Math.random() * (WORLD_HEIGHT - 200),
  };
}

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const c of wss.clients) {
    if (c.readyState === WebSocket.OPEN) c.send(msg);
  }
}

function makeSnapshot() {
  return {
    type: "snapshot",
    players: Array.from(players.values()).map((p) => ({
      id: p.id,
      name: p.name,
      x: p.x,
      y: p.y,
      angle: p.angle,
      color: p.color,
      hp: p.hp,
      alive: p.alive,
      kills: p.kills,
      deaths: p.deaths,
    })),
    bullets: bullets.map((b) => ({
      x: b.x,
      y: b.y,
    })),
  };
}

wss.on("connection", (socket) => {
  const id = crypto.randomUUID();
  const spawn = randomSpawn();

  const player = {
    id,
    socket,
    name: "Player",
    x: spawn.x,
    y: spawn.y,
    angle: 0,
    color: `hsl(${Math.random() * 360},70%,60%)`,
    input: {},
    lastShot: 0,

    hp: MAX_HP,
    alive: true,
    kills: 0,
    deaths: 0,
  };

  players.set(id, player);

  console.log("Player connected:", id);

  socket.send(JSON.stringify({ type: "welcome", id }));

  socket.on("message", (raw) => {
    const msg = JSON.parse(raw);

    if (msg.type === "join") {
      player.name = msg.name || "Player";
    }

    if (msg.type === "input") {
      player.input = msg;
    }
  });

  socket.on("close", () => {
    players.delete(id);
    console.log("Disconnected:", id);
  });
});

setInterval(() => {
  const dt = 1 / TICK_RATE;
  const now = Date.now();

  // MOVE + SHOOT
  for (const p of players.values()) {
    if (!p.alive) continue;

    let dx = 0,
      dy = 0;

    if (p.input.up) dy -= 1;
    if (p.input.down) dy += 1;
    if (p.input.left) dx -= 1;
    if (p.input.right) dx += 1;

    const len = Math.hypot(dx, dy);
    if (len > 0) {
      dx /= len;
      dy /= len;
    }

    p.x += dx * PLAYER_SPEED * dt;
    p.y += dy * PLAYER_SPEED * dt;

    p.x = clamp(p.x, 20, WORLD_WIDTH - 20);
    p.y = clamp(p.y, 20, WORLD_HEIGHT - 20);

    p.angle = p.input.angle || 0;

    if (p.input.shoot && now - p.lastShot > FIRE_COOLDOWN) {
      p.lastShot = now;

      bullets.push({
        owner: p.id,
        x: p.x,
        y: p.y,
        vx: Math.cos(p.angle) * BULLET_SPEED,
        vy: Math.sin(p.angle) * BULLET_SPEED,
        life: BULLET_LIFE,
      });
    }
  }

  // BULLETS
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];

    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;

    if (b.life <= 0) {
      bullets.splice(i, 1);
      continue;
    }

    // HIT DETECTION
    for (const p of players.values()) {
      if (!p.alive || p.id === b.owner) continue;

      const dist = Math.hypot(p.x - b.x, p.y - b.y);

      if (dist < PLAYER_RADIUS + BULLET_RADIUS) {
        p.hp -= DAMAGE;

        const shooter = players.get(b.owner);

        if (p.hp <= 0) {
          p.alive = false;
          p.deaths++;

          if (shooter) shooter.kills++;

          setTimeout(() => {
            const spawn = randomSpawn();
            p.x = spawn.x;
            p.y = spawn.y;
            p.hp = MAX_HP;
            p.alive = true;
          }, RESPAWN_TIME);
        }

        bullets.splice(i, 1);
        break;
      }
    }
  }

  broadcast(makeSnapshot());
}, 1000 / TICK_RATE);

console.log("Server running on 3001");