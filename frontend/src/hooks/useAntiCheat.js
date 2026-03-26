import { useEffect, useRef } from "react";

const EVENT_THROTTLE_MS = 1200;
const TYPE_COOLDOWN_MS = {
  devtools_open: 8000,
  split_screen_suspected: 7000,
  viewport_resize: 5000,
};
const VIEWPORT_DIFF_THRESHOLD = 220;
const SPLIT_SCREEN_AREA_RATIO = 0.62;

export function useAntiCheat({ active, onViolation }) {
  const lastEventRef = useRef({ key: "", at: 0 });
  const lastTypeEmitAtRef = useRef(new Map());

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    let previousViewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const emitViolation = (type) => {
      const now = Date.now();
      if (
        lastEventRef.current.key === type &&
        now - lastEventRef.current.at < EVENT_THROTTLE_MS
      ) {
        return;
      }

      const cooldown = TYPE_COOLDOWN_MS[type] || 0;
      const lastTypeEmitAt = lastTypeEmitAtRef.current.get(type) || 0;
      if (cooldown > 0 && now - lastTypeEmitAt < cooldown) {
        return;
      }

      lastEventRef.current = { key: type, at: now };
      lastTypeEmitAtRef.current.set(type, now);
      onViolation(type);
    };

    const evaluateViewportIntegrity = () => {
      const screenWidth =
        window.screen?.availWidth || window.screen?.width || window.innerWidth;
      const screenHeight =
        window.screen?.availHeight || window.screen?.height || window.innerHeight;
      const viewportArea = window.innerWidth * window.innerHeight;
      const screenArea = screenWidth * screenHeight;

      if (screenArea > 0) {
        const viewportRatio = viewportArea / screenArea;
        if (viewportRatio < SPLIT_SCREEN_AREA_RATIO) {
          emitViolation("split_screen_suspected");
        }
      }

      const devtoolsByDocking =
        window.outerWidth - window.innerWidth > VIEWPORT_DIFF_THRESHOLD ||
        window.outerHeight - window.innerHeight > VIEWPORT_DIFF_THRESHOLD;

      if (devtoolsByDocking) {
        emitViolation("devtools_open");
      }

      const resizedAggressively =
        Math.abs(window.innerWidth - previousViewport.width) >
          VIEWPORT_DIFF_THRESHOLD ||
        Math.abs(window.innerHeight - previousViewport.height) >
          VIEWPORT_DIFF_THRESHOLD;

      if (resizedAggressively) {
        emitViolation("viewport_resize");
      }

      previousViewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
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
      const isDevtoolsHotkey =
        event.key === "F12" ||
        ((event.ctrlKey || event.metaKey) && event.shiftKey && ["i", "j", "c"].includes(lowerKey)) ||
        ((event.ctrlKey || event.metaKey) && lowerKey === "u");

      if (isCopy) {
        event.preventDefault();
        emitViolation("copy_attempt");
      }

      if (isBack) {
        event.preventDefault();
        emitViolation("back_navigation");
      }

      if (isDevtoolsHotkey) {
        event.preventDefault();
        emitViolation("devtools_open");
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
    window.addEventListener("resize", evaluateViewportIntegrity);

    const integrityInterval = window.setInterval(
      evaluateViewportIntegrity,
      1500,
    );
    evaluateViewportIntegrity();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreen);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("resize", evaluateViewportIntegrity);
      window.clearInterval(integrityInterval);
    };
  }, [active, onViolation]);
}
