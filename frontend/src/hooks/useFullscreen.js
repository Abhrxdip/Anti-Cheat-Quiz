import { useCallback } from "react";

function getRootElement() {
  return document.documentElement;
}

export function useFullscreen() {
  const enterFullscreen = useCallback(async () => {
    const root = getRootElement();
    if (!document.fullscreenElement && root.requestFullscreen) {
      try {
        await root.requestFullscreen();
      } catch {
        // Browser can reject fullscreen without a user gesture.
      }
    }
  }, []);

  const isInFullscreen = useCallback(() => {
    return Boolean(document.fullscreenElement);
  }, []);

  return {
    enterFullscreen,
    isInFullscreen,
  };
}
