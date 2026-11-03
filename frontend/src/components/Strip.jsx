import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Native horizontal row (swipe / trackpad / arrows). Vertical page scrolling is never captured.
export const useStrip = () => {
  const ref = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", update); ro.disconnect(); };
  }, [update]);
  const move = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
  return { ref, edges, move, update };
};

export const StripArrows = ({ strip, testId }) => (strip.edges.start && strip.edges.end ? null : (
  <div className="flex gap-2" data-testid={testId}>
    {[[-1, ArrowLeft, strip.edges.start, "prev"], [1, ArrowRight, strip.edges.end, "next"]].map(([dir, Icon, off, name]) => (
      <button key={name} type="button" onClick={() => strip.move(dir)} disabled={off} aria-label={name} data-testid={`${testId}-${name}`}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-[background-color,color,opacity] duration-300 hover:bg-white hover:text-black disabled:pointer-events-none disabled:opacity-30">
        <Icon className="h-4 w-4" />
      </button>
    ))}
  </div>
));

export const StripRow = ({ strip, children, testId }) => (
  <div ref={strip.ref} data-testid={testId}
    className="op-noscrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 sm:-mx-10 sm:gap-6 sm:scroll-px-10 sm:px-10">
    {children}
  </div>
);
