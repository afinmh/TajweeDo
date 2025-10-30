"use client";

import { useEffect } from "react";

type Props = {
  targetId?: string;
  // Optional offset adjustment in pixels if there's a sticky header; positive moves further down
  offset?: number;
};

export const AutoScroll: React.FC<Props> = ({ targetId = "active-lesson", offset = 0 }) => {
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;

    // Prefer smooth centering; if offset needed, perform manual scroll after into view
    try {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      if (offset) {
        window.scrollBy({ top: offset, behavior: "instant" as ScrollBehavior });
      }
    } catch {
      // Fallback
      const rect = el.getBoundingClientRect();
      window.scrollTo({ top: window.scrollY + rect.top - window.innerHeight / 2 + offset, behavior: "smooth" });
    }
  }, [targetId, offset]);

  return null;
};
