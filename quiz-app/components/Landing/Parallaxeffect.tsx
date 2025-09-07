import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// DiscWithCubes
// - 6 cubes placed on a disc circumference
// - scroll controls rotation of the disc
// - container is clipped so only **3 cubes** are visible at once (left, center, right)
// - cubes outside the visible arc are hidden (opacity 0, pointer-events: none)
// - center cube is emphasized (scale + opacity + zIndex)

export default function FramerDiscWithCubes() {
  const NUM = 6;
  const radius = 180; // px distance from center to cube center
  const cubeSize = 110; // visible cube size

  // center of the viewport (in degrees): 0 = right, 90 = bottom, 180 = left, 270 = top
  const viewAngle = 0; // show center at the right (so visible trio = left/center/right around this point)
  const visibleWindow = 120; // degrees visible around viewAngle (approx 3 items)

  const ref = useRef(null);
  const { scrollYProgress } = useScroll(); // global page scroll

  // Map scroll progress to rotation degrees. Adjust multiplier to control speed.
  const rotation = useTransform(scrollYProgress, [0, 1], [0, 360 * 2]); // two full rotations over full page scroll

  // Local state to read rotation value (so we can compute angles in render)
  const [rotDeg, setRotDeg] = useState(0);

  useEffect(() => {
    const unsubscribe = rotation.onChange((v) => setRotDeg(v));
    return unsubscribe;
  }, [rotation]);

  // helper: normalize angle to [0,360)
  const norm = (a: number): number => {
    let v = a % 360;
    if (v < 0) v += 360;
    return v;
  };

  // helper: minimal angular difference between two angles (0..180)
  const angDiff = (a: number, b: number) => {
    const d = Math.abs(norm(a) - norm(b));
    return Math.min(d, 360 - d);
  };

  return (
    <div
      className="w-full min-h-[120vh] flex items-center justify-center bg-zinc-50 dark:bg-zinc-900"
      ref={ref}
    >
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-lg font-medium">
          Disc with cubes — scroll to rotate
        </h2>

        {/* clipped viewport: fixed width to show left / center / right */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            width: `${cubeSize * 3 + 48}px`,
            height: `${cubeSize + 48}px`,
          }}
        >
          {/* disc container centered inside clipped viewport */}
          <div
            className="absolute top-1/2 left-1/2"
            style={{
              width: `${radius * 2 + cubeSize}px`,
              height: `${radius * 2 + cubeSize}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* disc background (for visual) */}
            <motion.div
              className="absolute top-1/2 left-1/2 rounded-full border border-zinc-200 shadow-sm bg-white/60"
              style={{
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                transform: "translate(-50%, -50%)",
                rotate: `${rotDeg}deg`,
              }}
            />

            {/* cubes placed around circumference */}
            {Array.from({ length: NUM }).map((_, i) => {
              const baseAngle = (i * 360) / NUM; // initial angle
              const angle = baseAngle + rotDeg; // current angle

              const normalized = norm(angle);
              const diff = angDiff(normalized, viewAngle);

              // hide cubes outside the visible window
              const halfWindow = visibleWindow / 2;
              const isVisible = diff <= halfWindow;

              // compute closeness (1 when at viewAngle, 0 at edge of visible window)
              const closeness = isVisible
                ? Math.max(0, 1 - diff / halfWindow)
                : 0;

              // visual params
              const minScale = 0.7;
              const scale = minScale + 0.6 * closeness; // center cube bigger
              const opacity = 0.15 + 0.85 * closeness; // fully opaque at center, subtle at edges
              const zIndex = Math.round(10 + 20 * closeness);

              // vertical arc offset to create circular fashion (sine of angle)
              const angleRad = (angle * Math.PI) / 180;
              const yOffset = Math.sin(angleRad) * 18; // small arc effect

              // position transform: rotate(angle) translateX(radius) rotate(-angle) keep cube upright, then translateY for arc
              const transform = `translate(-50%, -50%) rotate(${angle}deg) translateX(${radius}px) rotate(${-angle}deg) translateY(${yOffset}px)`;

              return (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 flex items-center justify-center rounded-lg shadow-md"
                  style={{
                    width: `${cubeSize}px`,
                    height: `${cubeSize}px`,
                    transform,
                    scale,
                    opacity,
                    zIndex,
                    pointerEvents: isVisible ? "auto" : "none",
                    transition:
                      "transform 0.25s ease, opacity 0.25s ease, scale 0.25s ease",
                    background: "linear-gradient(180deg,#fafafa,#e6eefc)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    visibility: isVisible ? "visible" : "hidden",
                  }}
                >
                  {/* inner face content */}
                  <div className="text-sm font-semibold select-none">
                    Cube {i + 1}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <p className="text-sm text-zinc-500">
          Only three cubes are visible at once — left, center and right —
          arranged on a circular arc. Scroll to rotate the disc.
        </p>

        <div className="text-xs text-zinc-400">
          (Tip: adjust <code>visibleWindow</code>, <code>viewAngle</code>, and{" "}
          <code>radius</code> to tweak how many/which cubes are visible.)
        </div>
      </div>
    </div>
  );
}
