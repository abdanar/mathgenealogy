"use client";

import { useLayoutEffect } from "react";

const THEME_KEY = "theme";

function resolveAndApply() {
  let preference: "light" | "dark" | "system" = "system";
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") preference = stored;
  } catch {
    // localStorage unavailable; fall back to system preference.
  }

  const resolved =
    preference === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : preference;

  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.setAttribute("data-theme-pref", preference);
}

export function ThemeSync() {
  useLayoutEffect(() => {
    // Re-applies the persisted/system theme in case React's Strict Mode dev
    // remount cleared the attributes the inline head script set pre-hydration.
    resolveAndApply();

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", resolveAndApply);
    return () => media.removeEventListener("change", resolveAndApply);
  }, []);

  return null;
}
