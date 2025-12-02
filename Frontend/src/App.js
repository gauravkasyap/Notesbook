// useHorizontalScroll.js
// A React hook that maps window vertical scroll to a fixed horizontal container's scrollLeft.
// Usage: in component, pass refs: useHorizontalScroll(containerRef, spacerRef, options);

import { useEffect, useRef } from "react";

export default function useHorizontalScroll(containerRef, spacerRef, options = {}) {
  const {
    snap = true,
    snapDebounce = 300,
    snapDuration = 400,
    useFullHeight = true, // if true spacer = panelCount * vh, else (panelCount - 1) * vh
  } = options;

  const rafRef = useRef(null);
  const snapTimeoutRef = useRef(null);

  useEffect(() => {
    const container = containerRef?.current;
    const spacer = spacerRef.current;
    if (!container || !spacer) return;

    let panels = container.querySelectorAll(".panel");
    let panelCount = panels.length;

    // Set spacer height so page can scroll
    function setSpacerHeight() {
      const vh = window.innerHeight;
      // If useFullHeight true -> allow panelCount * vh vertical distance,
      // so scrolling starts at top and ends after full number of panels.
      // If false -> (panelCount - 1) * vh which is common if you want to begin on panel 0 and scroll to last.
      const factor = useFullHeight ? panelCount : Math.max(0, panelCount - 1);
      spacer.style.height = `${factor * vh}px`;
    }

    // Recompute values on resize
    function updateSizes() {
      panels = container.querySelectorAll(".panel");
      panelCount = panels.length;
      setSpacerHeight();
      // Also sync position immediately
      syncScroll();
    }

    setSpacerHeight();

    window.addEventListener("resize", updateSizes);

    // Maps vertical scroll to horizontal scrollLeft
    function syncScroll() {
      rafRef.current = null;

      const maxVertical = Math.max(0, spacer.offsetHeight - window.innerHeight);
      const maxHorizontal = Math.max(0, container.scrollWidth - window.innerWidth);

      const y = Math.max(0, Math.min(window.scrollY, maxVertical));
      const progress = maxVertical === 0 ? 0 : y / maxVertical;

      container.scrollLeft = progress * maxHorizontal;
    }

    function smoothScrollTo(element, target, duration = 400) {
      const start = element.scrollLeft;
      const change = target - start;
      const startTime = performance.now();

      function animate(now) {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        // easeInOutQuad
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        element.scrollLeft = start + change * ease;
        if (t < 1) requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
    }

    function snapToNearestPanel() {
      const maxVertical = Math.max(0, spacer.offsetHeight - window.innerHeight);
      const maxHorizontal = Math.max(0, container.scrollWidth - window.innerWidth);

      const y = Math.max(0, Math.min(window.scrollY, maxVertical));
      const progress = maxVertical === 0 ? 0 : y / maxVertical;
      const currentScrollLeft = progress * maxHorizontal;

      const panelWidth = window.innerWidth; // panels are 100vw
      const index = Math.round(currentScrollLeft / panelWidth);
      const targetScrollLeft = index * panelWidth;

      smoothScrollTo(container, targetScrollLeft, snapDuration);
    }

    function onScroll() {
      // schedule RAF update
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(syncScroll);
      }

      // handle snapping after scroll end
      if (snap) {
        if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
        snapTimeoutRef.current = setTimeout(() => {
          snapToNearestPanel();
        }, snapDebounce);
      }
    }

    // Optional: map vertical wheel to vertical scroll (default browser does that), but you might want to block vertical wheel
    // and map to window.scroll - not necessary here since we're using normal vertical page scroll.
    window.addEventListener("scroll", onScroll, { passive: true });

    // Initial sync in case page already scrolled
    syncScroll();

    return () => {
      window.removeEventListener("resize", updateSizes);
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
    };
  }, [containerRef, spacerRef, snap, snapDebounce, snapDuration, useFullHeight]);
}
