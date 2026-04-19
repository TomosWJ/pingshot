import { useState } from "react";
import { STORAGE_KEY } from "../game/constants";

export default function JoinOverlay({ connected, onJoin }) {
  const [nameInput, setNameInput] = useState(
    localStorage.getItem(STORAGE_KEY) || ""
  );

  const canJoin = connected && nameInput.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    onJoin(nameInput);
  };

  return (
    <div className="overlay fullscreen-overlay">
      <form onSubmit={handleSubmit} className="menu-card">
        <div className="menu-title">PingShot</div>
        <div className="menu-subtitle">Enter your name and jump in</div>

        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value.slice(0, 16))}
          placeholder="Your name"
          maxLength={16}
          autoFocus
          className="menu-input"
        />

        <button type="submit" disabled={!canJoin} className="menu-button">
          Play
        </button>

        <div className="menu-status">
          {connected ? "Server ready" : "Connecting to server..."}
        </div>
      </form>
    </div>
  );
}