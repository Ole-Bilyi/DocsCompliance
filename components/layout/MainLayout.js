"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from 'next/navigation';
import UserProfile from '../../app/session/UserProfile';
import Link from 'next/link';
import "../styles/MainLayout.scss";
// import { getGroup } from "../api/group";

const navLinks = [
  { href: "/mainPage", label: "Dashboard" },
  { href: "/userProfile", label: "Profile" },
  { href: "/group", label: "Group" },
  { href: "/settings", label: "Settings" },
];

const MainLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Centralized auth check for pages that use MainLayout
  useEffect(() => {
    const checkAuth = async () => {
      const email = UserProfile.getEmail();
      if (!email) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('/api/auth/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const authData = await res.json();
        if (!authData.authenticated) {
          router.push('/login');
          return;
        }

        if (!authData.hasGroup) {
          router.push('/join');
          return;
        }
      } catch (error) {
        console.error('Auth check failed (MainLayout):', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const displayName = useMemo(() => {
    return UserProfile.getName() || UserProfile.getEmail() || "Loading…";
  }, []);

  const groupName = useMemo(() => {
    return UserProfile.getGName() || "Workspace";
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(min-width: 1024px)");
    const syncSidebar = (event) => {
      const matches = event?.matches ?? mq.matches;
      setIsDesktop(matches);
      setIsSidebarOpen(matches);
    };

    syncSidebar();
    mq.addEventListener("change", syncSidebar);
    return () => mq.removeEventListener("change", syncSidebar);
  }, []);

  const handleSignOut = () => {
    UserProfile.setEmail("");
    UserProfile.setName("");
    UserProfile.setGName("");
    router.push("/login");
  };

  const toggleSidebar = () => {
    if (isDesktop) return;
    setIsSidebarOpen((prev) => !prev);
  };

  const collapseSidebarOnMobile = () => {
    if (isDesktop) return;
    setIsSidebarOpen(false);
  };

  return (
    <div className={`layout ${isSidebarOpen && !isDesktop ? "layout--sidebar-open" : ""}`}>
      <aside className={`sidebar ${isSidebarOpen ? "sidebar--open" : ""}${isDesktop ? " sidebar--desktop" : ""}`}>
        <div className="sidebar__brand">
          <span className="sidebar__logo">DC</span>
          <div>
            <p className="sidebar__eyebrow">DocsCompliance</p>
            <h2>{groupName}</h2>
          </div>
        </div>

        <nav className="sidebar__nav">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar__link ${isActive ? "is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
                onClick={collapseSidebarOnMobile}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar__footer">
          <button type="button" className="sidebar__logout" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </aside>

      {!isDesktop && isSidebarOpen && (
        <button
          type="button"
          className="layout__backdrop"
          aria-label="Close navigation overlay"
          onClick={collapseSidebarOnMobile}
        />
      )}

      <div className="layout__main">
        <header className="topbar">
          <button
            type="button"
            className="menu-button"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Collapse navigation" : "Expand navigation"}
          >
            <span />
            <span />
            <span />
          </button>

          <div className="topbar__breadcrumbs">
            <p className="topbar__eyebrow">Workspace overview</p>
            <h1>{groupName}</h1>
          </div>

          <div className="topbar__user">
            <div className="topbar__user-meta">
              <span className="topbar__user-label">Signed in as</span>
              <strong>{displayName}</strong>
            </div>
            <div className="topbar__avatar">
              {displayName
                .split(" ")
                .map((chunk) => chunk[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
