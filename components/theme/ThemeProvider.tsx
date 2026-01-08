'use client';

import React from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'themePreference';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(pref: ThemePreference) {
  const root = document.documentElement; // <html>
  const resolved = pref === 'system' ? getSystemTheme() : pref;
  if (resolved === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  // Optional: let CSS know current mode
  root.dataset.theme = resolved; // "light" | "dark"
}

type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = React.useState<ThemePreference>('system');

  // Initial load from localStorage (client-side)
  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    const pref: ThemePreference =
      stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    setPreferenceState(pref);
    applyTheme(pref);
  }, []);

  // React to preference changes
  React.useEffect(() => {
    // Avoid writing during the first render before hydration loads stored pref
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, preference);
    applyTheme(preference);

    // If system mode, listen for OS theme changes
    if (preference !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');

    // Safari compatibility
    if (mql.addEventListener) mql.addEventListener('change', handler);
    else mql.addListener(handler);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', handler);
      else mql.removeListener(handler);
    };
  }, [preference]);

  const setPreference = (p: ThemePreference) => setPreferenceState(p);

  return (
    <ThemeContext.Provider value={{ preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

/**
 * Inline script to prevent theme "flash" before hydration.
 * Put this in app/layout.tsx <head> via <ThemeInitScript />.
 */
export function ThemeInitScript() {
  const code = `
(function() {
  try {
    var key = '${STORAGE_KEY}';
    var pref = localStorage.getItem(key) || 'system';
    var isDark = false;
    if (pref === 'dark') isDark = true;
    else if (pref === 'light') isDark = false;
    else isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var root = document.documentElement;
    if (isDark) root.classList.add('dark'); else root.classList.remove('dark');
    root.dataset.theme = isDark ? 'dark' : 'light';
  } catch (e) {}
})();`.trim();

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
