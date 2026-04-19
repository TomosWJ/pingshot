const WebSocket = require("ws");
const crypto = require("crypto");

const PORT = 3001;
const TICK_RATE = 15;

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

const MAX_AMMO = 60;
const AMMO_PER_SHOT = 1;
const AMMO_REGEN_RATE = 15; // ammo per second

const wss = new WebSocket.Server({ port: PORT });

const players = new Map();
const bullets = [];
const killFeed = [];
const recentHits = [];

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
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

function makeSnapshot() {
  const now = Date.now();

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
      ammo: p.ammo,
      alive: p.alive,
      kills: p.kills,
      deaths: p.deaths,
    })),
    bullets: bullets.map((b) => ({
      x: b.x,
      y: b.y,
      vx: b.vx,
      vy: b.vy,
    })),
    killFeed: killFeed.slice(-8),
    recentHits: recentHits.filter((hit) => now - hit.time < 250),
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
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
    input: {
      up: false,
      down: false,
      left: false,
      right: false,
      angle: 0,
      shoot: false,
    },
    lastShot: 0,
    hp: MAX_HP,
    ammo: MAX_AMMO,
    alive: true,
    kills: 0,
    deaths: 0,
  };

  players.set(id, player);

  console.log(`Player connected: ${id}`);

  socket.send(JSON.stringify({ type: "welcome", id }));

  socket.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === "join") {
        player.name = String(msg.name || "Player").slice(0, 16);
      }

      if (msg.type === "input") {
        player.input.up = !!msg.up;
        player.input.down = !!msg.down;
        player.input.left = !!msg.left;
        player.input.right = !!msg.right;
        player.input.angle = Number(msg.angle) || 0;
        player.input.shoot = !!msg.shoot;
      }
    } catch (err) {
      console.error("Bad message:", err);
    }
  });

  socket.on("close", () => {
    players.delete(id);
    console.log(`Disconnected: ${id}`);
  });
});

setInterval(() => {
  const dt = 1 / TICK_RATE;
  const now = Date.now();

  for (const player of players.values()) {
    if (!player.alive) continue;

    let moveX = 0;
    let moveY = 0;

    if (player.input.up) moveY -= 1;
    if (player.input.down) moveY += 1;
    if (player.input.left) moveX -= 1;
    if (player.input.right) moveX += 1;

    const length = Math.hypot(moveX, moveY);
    if (length > 0) {
      moveX /= length;
      moveY /= length;
    }

    player.x += moveX * PLAYER_SPEED * dt;
    player.y += moveY * PLAYER_SPEED * dt;

    player.x = clamp(player.x, 20, WORLD_WIDTH - 20);
    player.y = clamp(player.y, 20, WORLD_HEIGHT - 20);

    player.angle = player.input.angle || 0;

    // Regenerate ammo
    if (player.ammo < MAX_AMMO) {
      player.ammo = Math.min(MAX_AMMO, player.ammo + AMMO_REGEN_RATE * dt);
    }

    if (player.input.shoot && now - player.lastShot >= FIRE_COOLDOWN && player.ammo >= AMMO_PER_SHOT) {
      player.lastShot = now;
      player.ammo -= AMMO_PER_SHOT;

      bullets.push({
        ownerId: player.id,
        x: player.x,
        y: player.y,
        vx: Math.cos(player.angle) * BULLET_SPEED,
        vy: Math.sin(player.angle) * BULLET_SPEED,
        life: BULLET_LIFE,
      });
    }
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];

    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;

    const outOfBounds =
      bullet.x < 0 ||
      bullet.x > WORLD_WIDTH ||
      bullet.y < 0 ||
      bullet.y > WORLD_HEIGHT;

    if (bullet.life <= 0 || outOfBounds) {
      bullets.splice(i, 1);
      continue;
    }

    let hitSomething = false;

    for (const player of players.values()) {
      if (!player.alive) continue;
      if (player.id === bullet.ownerId) continue;

      const distance = Math.hypot(player.x - bullet.x, player.y - bullet.y);

      if (distance < PLAYER_RADIUS + BULLET_RADIUS) {
        player.hp -= DAMAGE;

        recentHits.push({
          id: crypto.randomUUID(),
          attackerId: bullet.ownerId,
          victimId: player.id,
          time: Date.now(),
        });

        if (recentHits.length > 40) {
          recentHits.shift();
        }

        const shooter = players.get(bullet.ownerId);

        if (player.hp <= 0) {
          player.alive = false;
          player.deaths += 1;

          if (shooter) {
            shooter.kills += 1;

            killFeed.push({
              id: crypto.randomUUID(),
              killerId: shooter.id,
              killerName: shooter.name,
              victimId: player.id,
              victimName: player.name,
              time: Date.now(),
            });

            if (killFeed.length > 20) {
              killFeed.shift();
            }
          }

          setTimeout(() => {
            const spawn = randomSpawn();
            player.x = spawn.x;
            player.y = spawn.y;
            player.hp = MAX_HP;
            player.ammo = MAX_AMMO;
            player.alive = true;
          }, RESPAWN_TIME);
        }

        bullets.splice(i, 1);
        hitSomething = true;
        break;
      }
    }

    if (hitSomething) {
      continue;
    }
  }

  while (recentHits.length > 0 && now - recentHits[0].time > 300) {
    recentHits.shift();
  }

  broadcast(makeSnapshot());
}, 1000 / TICK_RATE);

console.log(`Server running on ws://localhost:${PORT}`);