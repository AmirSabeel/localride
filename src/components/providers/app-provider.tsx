"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", resolvedTheme === "dark" ? "#0A1F14" : "#ffffff");
    }
  }, [resolvedTheme]);

  // Listen for dark mode toggle events dispatched by the Zustand store
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ dark: boolean }>).detail;
      setTheme(detail.dark ? "dark" : "light");
    };
    document.addEventListener("localride:toggle-theme", handler);
    return () => document.removeEventListener("localride:toggle-theme", handler);
  }, [setTheme]);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("Service Worker registered on scope:", reg.scope))
          .catch((err) => console.error("Service Worker registration failed:", err));
      });
    }
  }, []);

  return <>{children}</>;
}