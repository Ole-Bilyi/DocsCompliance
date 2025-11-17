"use client";

import React, { useMemo } from "react";
import "../styles/ProfileCard.scss";
import UserProfile from "../../app/session/UserProfile";

const activity = [
  { title: "Updated vendor profile", meta: "Today • 10:12" },
  { title: "Signed SOC 2 addendum", meta: "Yesterday • 18:45" },
  { title: "Shared playbook with finance", meta: "Tue • 09:20" },
];

export default function UserProfileCard() {
  const name = useMemo(() => UserProfile.getName() || "Unnamed member", []);
  const email = useMemo(() => UserProfile.getEmail() || "no-email@unknown.com", []);
  const groupName = useMemo(() => UserProfile.getGName() || "No group assigned", []);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "DC";

  const handleLogout = () => {
    UserProfile.setEmail("");
    UserProfile.setName("");
    UserProfile.setGName("");
    window.location.href = "/login";
  };

  return (
    <section className="profile-shell">
      <header className="profile-hero">
        <div className="profile-hero__avatar">{initials}</div>
        <div>
          <p className="profile-hero__eyebrow">Profile overview</p>
          <h2>{name}</h2>
          <p>DocsCompliance member</p>
        </div>
        <div className="profile-hero__meta">
          <span>{groupName}</span>
          <small>current group</small>
        </div>
      </header>

      <div className="profile-grid">
        <article className="profile-card profile-card--form">
          <h3>Contact details</h3>
          <div className="input-row">
            <label>Name</label>
            <input name="name" value={name} readOnly />
          </div>

          <div className="input-row">
            <label>Email</label>
            <input name="email" value={email} readOnly />
          </div>

          <div className="profile-card__logout">
            <button type="button" className="ghost" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </article>

        <article className="profile-card profile-card--activity">
          <h3>Recent activity</h3>
          <ul>
            {activity.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.meta}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
