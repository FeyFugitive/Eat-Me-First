"use client";

import { useEffect } from "react";

/**
 * Registers the v1 offline service worker (public/sw.js).
 * Enables Add-to-Home-Screen shell to load after first visit without network.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silent: SW is best-effort polish; app still works online without it.
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}
