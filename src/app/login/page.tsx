"use client";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

function seeded(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

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

function useWind() {
  const [tick, setTick] = useState({ time: 0, windX: 0, windY: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const smoothRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let raf: number;
    const startTime = performance.now();

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener("mousemove", handleMouseMove);

    const loop = (now: number) => {
      const t = (now - startTime) / 1000;
      smoothRef.current.x += (targetRef.current.x - smoothRef.current.x) * 0.045;
      smoothRef.current.y += (targetRef.current.y - smoothRef.current.y) * 0.045;
      setTick({ time: t, windX: smoothRef.current.x, windY: smoothRef.current.y });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return tick;
}

type Plant = { left: number; height: number; phase: number; speed: number; boltHeight: number };

function generatePlants(count: number): Plant[] {
  const plants: Plant[] = [];
  for (let i = 0; i < count; i++) {
    const spread = count > 1 ? (i / (count - 1)) * 100 : 50;
    const jitter = (seeded(i * 1.7 + 1) - 0.5) * 3.5;
    plants.push({
      left: Math.min(99, Math.max(1, spread + jitter)),
      height: 130 + seeded(i * 3.1 + 2) * 100,
      phase: seeded(i * 5.3 + 3) * Math.PI * 2,
      speed: 0.5 + seeded(i * 7.9 + 4) * 0.4,
      boltHeight: 0.55 + seeded(i * 2.3 + 5) * 0.15,
    });
  }
  return plants;
}

const PLANTS = generatePlants(32);
const STEM_POINTS = 7;

function CottonField({ tick }: { tick: { time: number; windX: number; windY: number } }) {
  const idleAmplitude = 6 + tick.windY * 3;
  const mouseAmplitude = 26;

  return (
    <svg className="absolute bottom-0 left-0 w-full" height="66%" viewBox="0 0 1000 320" preserveAspectRatio="none">
      <defs>
        <linearGradient id="stemGradLogin" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#1f5c2a" />
          <stop offset="100%" stopColor="#5a9a4a" />
        </linearGradient>
      </defs>

      {PLANTS.map((plant, i) => {
        const baseX = plant.left * 10;
        const points = Array.from({ length: STEM_POINTS }, (_, j) => {
          const f = j / (STEM_POINTS - 1);
          const bendCurve = Math.pow(f, 1.7);
          const idleSway = Math.sin(tick.time * plant.speed + plant.phase + plant.left * 0.06) * idleAmplitude * bendCurve;
          const windSway = tick.windX * mouseAmplitude * bendCurve;
          return { x: baseX + idleSway + windSway, y: 320 - f * plant.height };
        });

        const path = smoothPath(points);
        const tip = points[points.length - 1];
        const upper = points[Math.round((STEM_POINTS - 1) * plant.boltHeight)];
        const prev = points[points.length - 2];
        const angle = (Math.atan2(tip.y - prev.y, tip.x - prev.x) * 180) / Math.PI + 90;

        return (
          <g key={i}>
            <ellipse cx={baseX} cy="319" rx="7" ry="2.4" fill="#3a5a2a" opacity="0.35" />
            <path d={path} stroke="url(#stemGradLogin)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            <g transform={`translate(${upper.x}, ${upper.y})`}>
              <circle cx="-4" cy="0" r="5.5" fill="#f4faee" />
              <circle cx="4" cy="1" r="5.5" fill="#eef5e2" />
              <circle cx="0" cy="-4" r="5.5" fill="#f8fcf3" />
            </g>
            <g transform={`translate(${tip.x}, ${tip.y}) rotate(${angle * 0.15})`}>
              <circle cx="-6" cy="2" r="6.5" fill="#eef5e2" />
              <circle cx="6" cy="2" r="6.5" fill="#eef5e2" />
              <circle cx="0" cy="-5" r="6.8" fill="#f8fcf3" />
              <circle cx="0" cy="4" r="7" fill="#e7f2dd" />
              <path d="M-3 8 h6 l-1.5 3c-1 1.4-2.5 1.4-3 0z" fill="#2f6b2a" />
            </g>
          </g>
        );
      })}
    </svg>
  );
}

type Cloud = { top: number; left: number; scale: number; phase: number; speed: number };

function generateClouds(count: number): Cloud[] {
  const clouds: Cloud[] = [];
  for (let i = 0; i < count; i++) {
    clouds.push({
      top: 4 + seeded(i * 2.2 + 1) * 14,
      left: (i / count) * 100 + (seeded(i * 4.4 + 2) - 0.5) * 12,
      scale: 0.7 + seeded(i * 6.6 + 3) * 0.7,
      phase: seeded(i * 8.8 + 4) * Math.PI * 2,
      speed: 0.15 + seeded(i * 3.3 + 5) * 0.15,
    });
  }
  return clouds;
}

const CLOUDS = generateClouds(7);

function CloudLayer({ tick }: { tick: { time: number; windX: number; windY: number } }) {
  return (
    <div className="absolute inset-x-0 top-0 h-[40%] pointer-events-none">
      {CLOUDS.map((cloud, i) => {
        const idleDrift = Math.sin(tick.time * cloud.speed + cloud.phase) * 10;
        const windDrift = tick.windX * 34;
        const bob = Math.sin(tick.time * cloud.speed * 1.3 + cloud.phase) * 4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${cloud.top}%`,
              left: `${cloud.left}%`,
              transform: `translate(${idleDrift + windDrift}px, ${bob}px) scale(${cloud.scale})`,
              transition: "transform 0.2s linear",
            }}
          >
            <svg width="140" height="60" viewBox="0 0 140 60" fill="none">
              <ellipse cx="45" cy="38" rx="34" ry="18" fill="#ffffff" opacity="0.9" />
              <ellipse cx="75" cy="30" rx="30" ry="20" fill="#ffffff" opacity="0.95" />
              <ellipse cx="100" cy="40" rx="26" ry="16" fill="#ffffff" opacity="0.85" />
              <ellipse cx="65" cy="44" rx="40" ry="14" fill="#ffffff" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

function FloatingInput({
  id, label, type, value, onChange, required, icon,
}: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; required?: boolean; icon: "mail" | "lock";
}) {
  const icons: Record<string, React.ReactNode> = {
    mail: <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
    lock: <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-12V7a4 4 0 00-8 0v2" />,
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-3.5 text-[#7fa06a]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {icons[icon]}
        </svg>
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder=" "
        className="peer w-full bg-[#f8faf0] border border-[#dde4c8] text-[#243a1a] rounded-xl pl-10 pr-4 pt-5 pb-2 outline-none transition-all duration-200 focus:border-[#1f6b2f] focus:bg-white focus:ring-2 focus:ring-[#1f6b2f]/25"
      />
      <label
        htmlFor={id}
        className="absolute left-10 top-3.5 text-[#7a8368] text-sm transition-all duration-200 pointer-events-none
          peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm
          peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#1f6b2f]
          peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs"
      >
        {label}
      </label>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const tick = useWind();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "Users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === "farmer") {
          router.push("/farmer/dashboard");
        } else {
          router.push("/company/dashboard");
        }
      } else {
        setError("User profile not found.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-gradient-to-b from-[#f6f9f0] via-[#eef4e2] to-[#e2edd0]">
      <div className="absolute inset-0 pointer-events-none">
        <CloudLayer tick={tick} />
        <CottonField tick={tick} />
      </div>

      <div className="relative z-10 w-full max-w-md fade-slide-in">
        <div className="bg-white/85 backdrop-blur-md border border-[#e0e6d0] rounded-3xl shadow-xl shadow-[#c9d4b0]/40 p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1f6b2f] to-[#5a9a4a] flex items-center justify-center shadow-md shadow-[#1f6b2f]/30 pulse-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M5 8c0 5 3 9 7 9s7-4 7-9M5 8c2 0 4-1 5-3M19 8c-2 0-4-1-5-3" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[#243a1a] tracking-tight">Welcome back</h1>
            <p className="text-[#4f6b3f] text-sm mt-1">Login to your FarmLink account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-5 shake">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <FloatingInput id="email" label="Email" type="email" value={email} onChange={setEmail} required icon="mail" />
            <FloatingInput id="password" label="Password" type="password" value={password} onChange={setPassword} required icon="lock" />

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl py-3 font-semibold text-white bg-gradient-to-r from-[#1f6b2f] to-[#5a9a4a] shadow-lg shadow-[#1f6b2f]/30 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {loading ? "Logging in..." : "Login"}
              </span>
              <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
            </button>
          </form>

          <p className="text-sm text-[#4f6b3f] text-center mt-6">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-[#1f6b2f] font-semibold hover:text-[#164f22] transition-colors">
              Register
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        .fade-slide-in { animation: fadeSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pulse-icon { animation: pulseIcon 2.5s ease-in-out infinite; }
        @keyframes pulseIcon {
          0%, 100% { box-shadow: 0 0 0 0 rgba(31, 107, 47, 0.35); }
          50% { box-shadow: 0 0 0 10px rgba(31, 107, 47, 0); }
        }
        .shake { animation: shake 0.4s ease-in-out; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
