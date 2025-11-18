"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/group.module.scss";
import UserProfile from '../../app/session/UserProfile';

const toPlainText = (value, fallback = '') => {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if ('user_name' in value) return value.user_name || fallback;
    if ('email' in value) return value.email || fallback;
  }
  return String(value);
};

export default function userGroup() {
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMembers = async (email) => {
    try {
      const res = await fetch('/api/auth/group-users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const payload = await res.json();
      if (payload.success && Array.isArray(payload.data)) {
        // map users into expected shape
        setMembers(payload.data.map((u, i) => ({ id: i + 1, name: u.user_name, email: u.email, joined: u.joined_at || '-' , admin: u.admin })));
      } else {
        setMembers([]);
      }
    } catch (e) {
      console.error('fetchMembers', e);
      setMembers([]);
    }
  };

  const fetchRequests = async (email) => {
    try {
      const res = await fetch('/api/group/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const payload = await res.json();
      if (payload.success && Array.isArray(payload.data)) {
        const normalized = payload.data.map((r, idx) => {
          const name = toPlainText(r.user_name, 'Unknown');
          const emailValue = toPlainText(r.email, '');
          const note = toPlainText(r.note, '');
          const id = emailValue || `req-${idx}`;
          return { id, name, email: emailValue, note, status: r.status };
        });
        setRequests(normalized);
      } else {
        setRequests([]);
      }
    } catch (e) {
      console.error('fetchRequests', e);
      setRequests([]);
    }
  };

  useEffect(() => {
    const email = UserProfile.getEmail();
    if (!email) return;
    setLoading(true);
    Promise.all([fetchMembers(email), fetchRequests(email)])
      .finally(() => setLoading(false));
  }, []);

  const acceptRequest = async (userEmail) => {
    const adminEmail = UserProfile.getEmail();
    try {
      const res = await fetch('/api/group/consent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userEmail, adminEmail, agree: true }) });
      const payload = await res.json();
      if (payload.success) {
        await fetchMembers(adminEmail);
        await fetchRequests(adminEmail);
      } else {
        setError(payload.error || 'Failed to accept');
      }
    } catch (e) {
      console.error('accept', e);
      setError('Failed to accept request');
    }
  };

  const rejectRequest = async (userEmail) => {
    const adminEmail = UserProfile.getEmail();
    try {
      const res = await fetch('/api/group/consent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userEmail, adminEmail, agree: false }) });
      const payload = await res.json();
      if (payload.success) {
        await fetchRequests(adminEmail);
      } else {
        setError(payload.error || 'Failed to reject');
      }
    } catch (e) {
      console.error('reject', e);
      setError('Failed to reject request');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <div className={styles.cardHeader}>
          <div className={styles.kicker}>Group</div>
          <h3>Team members</h3>
          <p className={styles.subtitle}>Manage members for your workspace.</p>
        </div>

        <div className={styles.toolbar}>
          <button className={styles.btn} onClick={() => setShowRequests(s => !s)}>{showRequests ? 'Hide join requests' : `Show join requests (${requests.length})`}</button>
        </div>

        {showRequests && (
          <div className={styles.requestsPanel} role="region" aria-label="Join requests">
            {requests.length === 0 ? (
              <div className={styles.empty}>No pending requests</div>
            ) : (
              requests.map(r => (
                <div key={r.id} className={styles.requestItem}>
                  <div className={styles.requestInfo}>
                    <div className={styles.reqName}>{r.name}</div>
                    <div className={styles.reqEmail}>{r.email}</div>
                    <div className={styles.reqNote}>{r.note}</div>
                  </div>
                  <div className={styles.requestActions}>
                    <button className={styles.acceptBtn} onClick={() => acceptRequest(r.email)}>Accept</button>
                    <button className={styles.rejectBtn} onClick={() => rejectRequest(r.email)}>Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={i}>
                  <td>{m.name}</td>
                  <td className={styles.break}>{m.email}</td>
                  <td>{m.admin ? 'Admin' : 'Member'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}