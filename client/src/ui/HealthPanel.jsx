export default function HealthPanel({ me }) {
  const hpPercent = me ? Math.max(0, Math.min(100, me.hp || 0)) : 0;
  const ammoPercent = me ? Math.max(0, Math.min(100, ((me.ammo || 0) / 60) * 100)) : 0;

  return (
    <div className="panel health-panel">
      <div className="panel-text health-label">Health</div>

      <div className="health-bar-shell">
        <div
          className={`health-bar-fill ${hpPercent > 30 ? "healthy" : "low"}`}
          style={{ width: `${hpPercent}%` }}
        />
      </div>

      <div className="panel-text health-value">{me ? `${me.hp} HP` : "--"}</div>

      <div className="panel-text health-label" style={{ marginTop: "12px" }}>
        Ammo
      </div>

      <div className="health-bar-shell">
        <div
          className="health-bar-fill ammo"
          style={{ width: `${ammoPercent}%` }}
        />
      </div>

      <div className="panel-text health-value">
        {me ? `${Math.ceil(me.ammo)} / 60` : "--"}
      </div>
    </div>
  );
}