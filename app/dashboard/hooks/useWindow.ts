"use client";

import { useState, useEffect } from "react";

/**
 * Window/responsive hook.
 * Manages window dimensions, client-side rendering flag, privacy consent modal,
 * and keyboard shortcuts.
 *
 * @param setShowModal - Setter for the main modal visibility (for ESC key handling)
 */
export function useWindow(
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [windowWidth, setWindowWidth] = useState(1280);
  const [isClient, setIsClient] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [privacyConsented, setPrivacyConsented] = useState(false);

  /**
   * Client-side initialization effect.
   * Sets up responsive behavior, keyboard shortcuts, and privacy consent.
   */
  useEffect(() => {
    setIsClient(true);
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const savedConsent = localStorage.getItem("jira-clone-privacy-consent");
    if (!savedConsent) {
      setShowPrivacyModal(true);
    } else {
      setPrivacyConsented(true);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // === RESPONSIVE UTILITIES ===
  const effectiveWidth = isClient ? windowWidth : 1280;
  const isSmall = effectiveWidth <= 768;
  const isMedium = effectiveWidth <= 1024;

  return {
    windowWidth,
    isClient,
    showPrivacyModal,
    setShowPrivacyModal,
    privacyConsented,
    setPrivacyConsented,
    effectiveWidth,
    isSmall,
    isMedium,
  };
}
