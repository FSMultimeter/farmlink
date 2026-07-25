"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

function CloudLayer() {
  const clouds = [
    { top: 5, left: 8, scale: 0.8, duration: "24s" },
    { top: 12, left: 35, scale: 1.1, duration: "32s" },
    { top: 8, left: 68, scale: 0.9, duration: "28s" },
    { top: 15, left: 85, scale: 0.75, duration: "36s" },
  ];

  return (
    <div className="absolute inset-x-0 top-0 h-[40%] pointer-events-none overflow-hidden">
      {clouds.map((cloud, i) => (
        <div
          key={i}
          className="absolute animate-cloud-drift"
          style={{
            top: `${cloud.top}%`,
            left: `${cloud.left}%`,
            transform: `scale(${cloud.scale})`,
            animationDuration: cloud.duration,
          }}
        >
          <svg width="140" height="60" viewBox="0 0 140 60" fill="none">
            <ellipse cx="45" cy="38" rx="34" ry="18" fill="#ffffff" opacity="0.85" />
            <ellipse cx="75" cy="30" rx="30" ry="20" fill="#ffffff" opacity="0.9" />
            <ellipse cx="100" cy="40" rx="26" ry="16" fill="#ffffff" opacity="0.8" />
            <ellipse cx="65" cy="44" rx="40" ry="14" fill="#ffffff" />
          </svg>
        </div>
      ))}
    </div>
  );
}

function FloatingInput({
  id,
  label,
  type,
  value,
  onChange,
  required,
  icon,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  icon: "mail" | "lock";
}) {
  const icons: Record<string, React.ReactNode> = {
    mail: <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
    lock: <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-12V7a4 4 0 00-8 0v2" />,
  };

  return (
    <div className="relative">
      <span className="absolute left-3.5 top-3.5 text-[#5A6C4D] peer-focus:text-[#2E7D32]">
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
        className="peer w-full bg-[#FAF7F0] border border-[#DDE4C8] text-[#243A1A] rounded-xl pl-10 pr-4 pt-5 pb-2 outline-none transition-all duration-200 focus:border-[#2E7D32] focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/25 text-sm"
      />
      <label
        htmlFor={id}
        className="absolute left-10 top-3.5 text-[#6C755D] text-sm transition-all duration-200 pointer-events-none
          peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm
          peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#2E7D32]
          peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs"
      >
        {label}
      </label>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
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
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-[#1B3A1F] via-[#2E7D32] to-[#66BB6A]">
      {/* Background Cloud Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <CloudLayer />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md animate-fade-slide-in">
        <div className="bg-white/88 backdrop-blur-md border border-[#E0E6D0] rounded-3xl shadow-xl shadow-[#2E7D32]/10 p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-[#243A1A] tracking-tight">Welcome Back</h1>
            <p className="text-[#5A6C4D] text-sm mt-1 font-medium">Log in to your FarmLink account</p>
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
              className="group relative w-full overflow-hidden rounded-xl py-3.5 font-semibold text-white bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] shadow-lg shadow-[#2E7D32]/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 text-sm"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {loading ? "Logging in..." : "Login to FarmLink"}
              </span>
              <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
            </button>
          </form>

          <p className="text-sm text-[#5A6C4D] text-center mt-6">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-[#2E7D32] font-semibold hover:text-[#1F6B2F] transition-colors">
              Register here
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-slide-in {
          animation: fadeSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .shake {
          animation: shake 0.4s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        @keyframes cloudDrift {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(18px); }
        }
        .animate-cloud-drift {
          animation: cloudDrift infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
