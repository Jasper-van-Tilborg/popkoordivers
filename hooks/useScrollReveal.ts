import { useEffect, useRef } from "react";

export function useScrollReveal(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const targets = Array.from(container.querySelectorAll<Element>(".reveal, .reveal-fade"));
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Double rAF ensures the browser has painted opacity:0 before animating
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                entry.target.classList.add("in-view");
              });
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((t) => observer.observe(t));

    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
