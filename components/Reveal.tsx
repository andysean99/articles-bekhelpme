"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scroll-reveal that is VISIBLE BY DEFAULT.
 *
 * The content renders fully visible in SSR and on first paint, so the page is
 * never blank if JavaScript is slow, disabled, or errors during hydration.
 * The fade-up is a pure-CSS enhancement driven by IntersectionObserver:
 *   - above-the-fold content stays statically visible (no flash on load)
 *   - below-the-fold content fades up as it scrolls into view
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen → leave visible, don't animate (avoids a flash).
    if (el.getBoundingClientRect().top <= window.innerHeight * 0.92) return;

    // Below the fold (off-screen) → safe to start hidden, then reveal on scroll.
    setHidden(true);
    const io = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          setHidden(false);
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? "translateY(18px)" : "translateY(0)",
        transition:
          "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)",
        transitionDelay: `${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
