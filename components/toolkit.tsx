"use client";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ToolIcon } from "@/components/tool-icon";

export function Toolkit({ skills }: { skills: string }) {
  const items = useMemo(() => skills.split(",").map(item => item.trim()).filter(Boolean), [skills]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLUListElement>(null);
  const [metrics, setMetrics] = useState({ overflow: false, distance: 0 });

  useEffect(() => {
    const viewport = viewportRef.current;
    const group = groupRef.current;
    if (!viewport || !group) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = group.getBoundingClientRect().width;
        const track = group.parentElement;
        const gap = track ? parseFloat(getComputedStyle(track).columnGap) || 0 : 0;
        const next = { overflow: width > viewport.clientWidth + 1, distance: width + gap };
        setMetrics(previous =>
          previous.overflow === next.overflow && Math.abs(previous.distance - next.distance) < 0.5
            ? previous : next,
        );
      });
    };
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", measure); };
    }
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(group);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [items]);

  const style = {
    "--toolkit-distance": metrics.distance + "px",
    "--toolkit-duration": Math.max(metrics.distance / 35, 12) + "s",
  } as CSSProperties;
  const renderItems = () => items.map((item, index) => (
    <li className="toolkit-item" key={item + index}>
      <ToolIcon name={item} size={18} /><span>{item}</span>
    </li>
  ));

  return (
    <div className="stack-band reveal">
      <div className="shell">
        <div className="toolkit-heading">
          <span className="mono">MY EVERYDAY TOOLKIT</span>
        </div>
        <div ref={viewportRef} className="toolkit-viewport"
          data-overflow={metrics.overflow}
          tabIndex={metrics.overflow ? 0 : undefined}
          role="region" aria-label="Công cụ và công nghệ" style={style}>
          <div className="toolkit-track">
            <ul ref={groupRef} className="toolkit-group">{renderItems()}</ul>
            {metrics.overflow && (
              <ul className="toolkit-group toolkit-copy" aria-hidden="true">{renderItems()}</ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
