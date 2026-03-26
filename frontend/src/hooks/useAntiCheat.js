import { useEffect, useRef } from "react";

const EVENT_THROTTLE_MS = 1200;

export function useAntiCheat({ active, onViolation }) {
  const lastEventRef = useRef({ key: "", at: 0 });

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const emitViolation = (type) => {
      const now = Date.now();
      if (
        lastEventRef.current.key === type &&
        now - lastEventRef.current.at < EVENT_THROTTLE_MS
      ) {
        return;
      }
      lastEventRef.current = { key: type, at: now };
      onViolation(type);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        emitViolation("tab_switch");
      }
    };

    const handleBlur = () => emitViolation("window_blur");

    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        emitViolation("fullscreen_exit");
      }
    };

    const handleContextMenu = (event) => {
      event.preventDefault();
      emitViolation("right_click");
    };

    const handleKeyDown = (event) => {
      const lowerKey = event.key.toLowerCase();
      const isCopy = (event.ctrlKey || event.metaKey) && lowerKey === "c";
      const isBack = event.key === "Backspace" &&
        !["INPUT", "TEXTAREA"].includes(event.target?.tagName);

      if (isCopy) {
        event.preventDefault();
        emitViolation("copy_attempt");
      }

      if (isBack) {
        event.preventDefault();
        emitViolation("back_navigation");
      }
    };

    const handleBeforeUnload = (event) => {
      emitViolation("before_unload");
      event.preventDefault();
      event.returnValue = "";
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreen);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreen);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [active, onViolation]);
}
