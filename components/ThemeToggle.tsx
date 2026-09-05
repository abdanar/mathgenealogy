"use client";

const THEME_KEY = "theme";
type ThemePreference = "light" | "dark" | "system";

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference !== "system") return preference;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyPreference(preference: ThemePreference) {
  document.documentElement.setAttribute("data-theme", resolveTheme(preference));
  document.documentElement.setAttribute("data-theme-pref", preference);
  try {
    localStorage.setItem(THEME_KEY, preference);
  } catch {
    // localStorage unavailable; theme just won't persist across visits.
  }
}

export function ThemeToggle() {
  function handleClick() {
    const current = readPreference();
    const next: ThemePreference = current === "system" ? "light" : current === "light" ? "dark" : "system";
    applyPreference(next);
  }

  return (
    <button type="button" className="theme-toggle" aria-label="Toggle color theme" onClick={handleClick}>
      <svg className="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4.6" />
        <path d="M12 3v2.2M12 18.8V21M4.4 4.4l1.55 1.55M18.05 18.05l1.55 1.55M3 12h2.2M18.8 12H21M4.4 19.6l1.55-1.55M18.05 5.95l1.55-1.55" />
      </svg>
      <svg className="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true" viewBox="0 0 24 24">
        <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.6 6.6 0 0 0 10.5 10.5Z" />
      </svg>
    </button>
  );
}
