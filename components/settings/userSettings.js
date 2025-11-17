"use client";

import React, { useState } from "react";
import "../styles/Settings.scss";
import UserProfile from "../../app/session/UserProfile";

const defaultToggles = {
  weeklySummary: true,
  criticalAlerts: true,
  ndaReminders: false,
  productUpdates: true,
};

export default function UserSettings() {
  const [themePreference, setThemePreference] = useState("system");
  const [timezone, setTimezone] = useState("UTC");
  const [toggles, setToggles] = useState(defaultToggles);
  const [message, setMessage] = useState(null);

  const handleToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("Preferences updated");
    setTimeout(() => setMessage(null), 2000);
  };

  const displayName = UserProfile.getName() || UserProfile.getEmail() || "your account";

  return (
    <section className="settings">
      <header className="settings__hero">
        <div>
          <p className="settings__eyebrow">Workspace settings</p>
          <h2>Control center</h2>
          <p>Fine-tune notifications, themes, and account data for {displayName}.</p>
        </div>
        <div className="settings__summary">
          <span>{timezone}</span>
          <small>current timezone</small>
        </div>
      </header>

      <form className="settings__grid" onSubmit={handleSubmit}>
        <article className="settings-card">
          <header>
            <h3>Appearance</h3>
            <p>Choose how DocsCompliance matches your system layout.</p>
          </header>

          <div className="settings-card__options">
            {["system", "light", "dark"].map((mode) => (
              <label key={mode} className={`option ${themePreference === mode ? "is-active" : ""}`}>
                <input
                  type="radio"
                  name="theme"
                  value={mode}
                  checked={themePreference === mode}
                  onChange={(e) => setThemePreference(e.target.value)}
                />
                <span>{mode}</span>
              </label>
            ))}
          </div>
        </article>

        <article className="settings-card">
          <header>
            <h3>Notifications</h3>
            <p>Stay informed about deadlines and activity.</p>
          </header>

          <ul className="toggle-list">
            {Object.entries(toggles).map(([key, value]) => (
              <li key={key}>
                <div>
                  <strong>{key.replace(/([A-Z])/g, " $1")}</strong>
                  <span>Receive {key.toLowerCase()} via e-mail.</span>
                </div>
                <button
                  type="button"
                  className={`toggle ${value ? "is-on" : ""}`}
                  onClick={() => handleToggle(key)}
                >
                  <span />
                </button>
              </li>
            ))}
          </ul>
        </article>

        <article className="settings-card">
          <header>
            <h3>Locale</h3>
            <p>Set when reminders hit your inbox.</p>
          </header>

          <label className="select">
            <span>Timezone</span>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              <option value="UTC">UTC</option>
              <option value="EST">EST (GMT-5)</option>
              <option value="PST">PST (GMT-8)</option>
              <option value="CET">CET (GMT+1)</option>
            </select>
          </label>
        </article>

        <article className="settings-card settings-card--danger">
          <header>
            <h3>Danger zone</h3>
            <p>Delete cached profile data from this device.</p>
          </header>

          <button
            type="button"
            className="danger"
            onClick={() => {
              UserProfile.setEmail("");
              UserProfile.setName("");
              UserProfile.setGName("");
              setMessage("Local profile cleared");
            }}
          >
            Clear profile cache
          </button>
        </article>

        <div className="settings__actions">
          <button type="submit" className="primary">
            Save changes
          </button>
          {message && <span className="settings__message">{message}</span>}
        </div>
      </form>
    </section>
  );
}