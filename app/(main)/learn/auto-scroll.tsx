"use client";

import { useEffect } from "react";

type Props = {
  targetId?: string;
  // Optional offset adjustment in pixels if there's a sticky header; positive moves further down
  offset?: number;
};

export const AutoScroll: React.FC<Props> = ({ targetId = "active-lesson", offset = 0 }) => {
  useEffect(() => {
    let stopped = false;
    const attempt = () => {
      if (stopped) return;
      const el = document.getElementById(targetId);
      if (el) {
        try {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          if (offset) {
            window.scrollBy({ top: offset, behavior: "instant" as ScrollBehavior });
          }
        } catch {
          const rect = el.getBoundingClientRect();
          window.scrollTo({ top: window.scrollY + rect.top - window.innerHeight / 2 + offset, behavior: "smooth" });
        }
        stopped = true;
        return;
      }
      // Retry on next frame while content hydrates/streams
      requestAnimationFrame(attempt);
    };
    // Also stop retries after ~2 seconds just in case
    const timeout = setTimeout(() => { stopped = true; }, 2000);
    attempt();
    return () => { stopped = true; clearTimeout(timeout); };
  }, [targetId, offset]);

  return null;
};
