"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import InteractiveWheatField from "@/components/InteractiveWheatField";

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
  minLength,
  icon,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
  icon: "user" | "mail" | "lock";
}) {
  const icons: Record<string, React.ReactElement> = {
    user: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 0116 0" />,
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
        minLength={minLength}
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

function RoleButton({ active, onClick, label, emoji }: { active: boolean; onClick: () => void; label: string; emoji: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold border transition-all duration-200 hover:-translate-y-0.5 ${
        active
          ? "bg-gradient-to-br from-[#E8F5E9] to-[#DCEDC8] border-[#2E7D32] text-[#1B5E20] shadow-md shadow-[#2E7D32]/20 scale-[1.02]"
          : "bg-[#FAF7F0] border-[#DDE4C8] text-[#5A6C4D] hover:bg-white hover:border-[#2E7D32]"
      }`}
    >
      <span>{emoji}</span>
      {label}
    </button>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("farmer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ["Too short", "Weak", "Okay", "Good", "Strong"][passwordStrength];
  const strengthColor = ["#dfe6d2", "#c96a4f", "#a8a23a", "#5a9a4a", "#1f6b2f"][passwordStrength];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "Users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: role,
        createdAt: new Date().toISOString(),
      });

      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-gradient-to-b from-[#FAF7F0] via-[#F4F8EC] to-[#DCEDC8]">
      {/* Background Cloud Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <CloudLayer />
      </div>

      {/* Interactive Swaying & Mouse-Brushed Wheat Field */}
      <InteractiveWheatField />

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-md animate-fade-slide-in">
        <div className="bg-white/88 backdrop-blur-md border border-[#E0E6D0] rounded-3xl shadow-xl shadow-[#2E7D32]/10 p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] flex items-center justify-center shadow-md shadow-[#2E7D32]/30 pulse-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M5 8c0 5 3 9 7 9s7-4 7-9M5 8c2 0 4-1 5-3M19 8c-2 0-4-1-5-3" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-[#243A1A] tracking-tight">Join FarmLink</h1>
            <p className="text-[#5A6C4D] text-sm mt-1 font-medium">Create an account to buy or sell crops</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-5 shake">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <FloatingInput id="name" label="Full Name" type="text" value={name} onChange={setName} required icon="user" />
            <FloatingInput id="email" label="Email" type="email" value={email} onChange={setEmail} required icon="mail" />

            <div>
              <FloatingInput id="password" label="Password" type="password" value={password} onChange={setPassword} required minLength={6} icon="lock" />
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-[#E0E6D0] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${(passwordStrength / 4) * 100}%`, background: strengthColor }}
                    />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: strengthColor }}>
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5A6C4D] mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <RoleButton active={role === "farmer"} onClick={() => setRole("farmer")} label="Farmer" emoji="🌾" />
                <RoleButton active={role === "company"} onClick={() => setRole("company")} label="Company" emoji="🏢" />
              </div>
            </div>

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
                {loading ? "Creating Account..." : "Create Account"}
              </span>
              <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
            </button>
          </form>

          <p className="text-sm text-[#5A6C4D] text-center mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-[#2E7D32] font-semibold hover:text-[#1F6B2F] transition-colors">
              Log in
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
          to { opacity: 1; transform: translateY(0); }
        }
        .pulse-icon {
          animation: pulseIcon 2.5s ease-in-out infinite;
        }
        @keyframes pulseIcon {
          0%, 100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.35); }
          50% { box-shadow: 0 0 0 12px rgba(46, 125, 50, 0); }
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
