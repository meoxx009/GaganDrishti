"use client";

import { useEffect } from "react";

export const PwaRegistrar: React.FC = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker on window load
      const registerSW = () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((registration) => {
            console.log(
              "[GaganDrishti PWA] Service Worker registered with scope:",
              registration.scope
            );

            // Listen for service worker updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    console.log(
                      "[GaganDrishti PWA] New update available! Reloading will apply changes."
                    );
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.warn(
              "[GaganDrishti PWA] Service Worker registration failed:",
              error
            );
          });
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    }
  }, []);

  return null;
};