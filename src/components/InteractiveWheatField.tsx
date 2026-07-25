"use client";

import React, { useEffect, useRef, useState } from "react";

// Deterministic random helper
function seeded(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// Smooth Catmull-Rom to Bezier path generator
function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

interface PlantConfig {
  id: number;
  leftPct: number; // 0 to 100
  baseX: number;  // 0 to 1200
  height: number; // 130 to 240
  phase: number;
  speed: number;
  boltHeight: number;
  currentInteractiveBend: number; // smoothed lerp value
}

function generatePlants(count: number): PlantConfig[] {
  const plants: PlantConfig[] = [];
  for (let i = 0; i < count; i++) {
    const spread = count > 1 ? (i / (count - 1)) * 100 : 50;
    const jitter = (seeded(i * 1.7 + 1) - 0.5) * 3;
    const leftPct = Math.min(99, Math.max(1, spread + jitter));
    plants.push({
      id: i,
      leftPct,
      baseX: leftPct * 12, // scaled for 1200 viewBox width
      height: 140 + seeded(i * 3.1 + 2) * 110,
      phase: seeded(i * 5.3 + 3) * Math.PI * 2,
      speed: 0.6 + seeded(i * 7.9 + 4) * 0.4,
      boltHeight: 0.55 + seeded(i * 2.3 + 5) * 0.15,
      currentInteractiveBend: 0,
    });
  }
  return plants;
}

const PLANT_COUNT = 38;
const INITIAL_PLANTS = generatePlants(PLANT_COUNT);
const STEM_POINTS = 7;

export default function InteractiveWheatField() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const plantsRef = useRef<PlantConfig[]>(INITIAL_PLANTS);
  const [, setRenderTrigger] = useState(0);

  // Mouse tracking in SVG space
  const mousePosRef = useRef<{ x: number; y: number; active: boolean; velX: number }>({
    x: -9999,
    y: -9999,
    active: false,
    velX: 0,
  });
  const prevMouseXRef = useRef<number>(-9999);

  useEffect(() => {
    let rafId: number;
    let startTime = performance.now();

    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      // Calculate cursor position in SVG 0-1200 x 0-360 coordinates
      const svgX = ((e.clientX - rect.left) / rect.width) * 1200;
      const svgY = ((e.clientY - rect.top) / rect.height) * 360;

      const velX = prevMouseXRef.current !== -9999 ? svgX - prevMouseXRef.current : 0;
      prevMouseXRef.current = svgX;

      mousePosRef.current = {
        x: svgX,
        y: svgY,
        active: e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom,
        velX,
      };
    };

    const handleMouseLeave = () => {
      mousePosRef.current.active = false;
      prevMouseXRef.current = -9999;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    const animationLoop = (now: number) => {
      const time = (now - startTime) / 1000;
      const { x: mouseX, active: isMouseActive, velX } = mousePosRef.current;
      const radius = 180; // Proximity radius for interactive sway

      plantsRef.current.forEach((plant) => {
        let targetBend = 0;

        if (isMouseActive) {
          const dist = plant.baseX - mouseX;
          const absDist = Math.abs(dist);

          if (absDist < radius) {
            const proximity = Math.pow(1 - absDist / radius, 1.8);
            // Push away from cursor + add directional velocity push
            const pushDir = dist === 0 ? 1 : dist / absDist;
            const staticPush = pushDir * proximity * 35;
            const dynamicPush = Math.min(30, Math.max(-30, velX * proximity * 1.5));
            targetBend = staticPush + dynamicPush;
          }
        }

        // Smooth Lerp Spring Effect (silk-like physics)
        plant.currentInteractiveBend += (targetBend - plant.currentInteractiveBend) * 0.095;
      });

      // Decay velocity slowly
      mousePosRef.current.velX *= 0.85;

      setRenderTrigger(time);
      rafId = requestAnimationFrame(animationLoop);
    };

    rafId = requestAnimationFrame(animationLoop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const time = performance.now() / 1000;

  return (
    <div className="absolute inset-x-0 bottom-0 h-[65%] pointer-events-auto overflow-hidden">
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 1200 360"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wheatStemGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#1f5c2a" />
            <stop offset="60%" stopColor="#2e7d32" />
            <stop offset="100%" stopColor="#5a9a4a" />
          </linearGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {plantsRef.current.map((plant) => {
          const baseX = plant.baseX;
          // Idle wind sway formula
          const idleWind = Math.sin(time * plant.speed + plant.phase + plant.leftPct * 0.08) * (8 + Math.sin(time * 0.7) * 4);
          const totalTipOffset = idleWind + plant.currentInteractiveBend;

          const points = Array.from({ length: STEM_POINTS }, (_, j) => {
            const f = j / (STEM_POINTS - 1);
            const bendCurve = Math.pow(f, 1.6);
            return {
              x: baseX + totalTipOffset * bendCurve,
              y: 360 - f * plant.height,
            };
          });

          const path = smoothPath(points);
          const tip = points[points.length - 1];
          const upper = points[Math.round((STEM_POINTS - 1) * plant.boltHeight)];
          const prev = points[points.length - 2];
          const angle = (Math.atan2(tip.y - prev.y, tip.x - prev.x) * 180) / Math.PI + 90;

          return (
            <g key={plant.id} className="transition-opacity duration-300">
              {/* Base Ground Shadow */}
              <ellipse cx={baseX} cy="358" rx="8" ry="2.6" fill="#2d4a22" opacity="0.35" />

              {/* Stem Path */}
              <path
                d={path}
                stroke="url(#wheatStemGrad)"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />

              {/* Lower Grain Cluster */}
              <g transform={`translate(${upper.x}, ${upper.y})`}>
                <circle cx="-4" cy="0" r="5.5" fill="#f4faee" />
                <circle cx="4" cy="1" r="5.5" fill="#eef5e2" />
                <circle cx="0" cy="-4" r="5.5" fill="#f8fcf3" />
              </g>

              {/* Top Wheat Head Cluster */}
              <g transform={`translate(${tip.x}, ${tip.y}) rotate(${angle * 0.18})`}>
                <circle cx="-6" cy="2" r="6.5" fill="#eef5e2" />
                <circle cx="6" cy="2" r="6.5" fill="#eef5e2" />
                <circle cx="0" cy="-5" r="6.8" fill="#f8fcf3" />
                <circle cx="0" cy="4" r="7" fill="#e7f2dd" />
                <path d="M-3 8 h6 l-1.5 3.5c-1 1.4-2.5 1.4-3 0z" fill="#2f6b2a" />
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
