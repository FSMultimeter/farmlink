"use client";

import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-[#1B3A1F] via-[#2E7D32] to-[#66BB6A]">
    

      {/* Main Content Card */}
      <div className="relative z-10 w-full max-w-md text-center animate-fade-slide-in">
        <div className="bg-white/85 backdrop-blur-md border border-[#E0E6D0] rounded-3xl shadow-xl shadow-[#2E7D32]/10 p-8 sm:p-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#243A1A] mb-2">
            FarmLink
          </h1>
          <p className="text-[#5A6C4D] text-sm leading-relaxed mb-8 max-w-xs mx-auto font-medium">
            Connecting farmers and agricultural buyers directly — one harvest at a time.
          </p>

          <div className="flex flex-col gap-3.5">
            <button
              onClick={() => router.push("/register")}
              className="group relative w-full overflow-hidden rounded-xl py-3.5 font-semibold text-white bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] shadow-lg shadow-[#2E7D32]/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Get Started
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
              <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
            </button>

            <button
              onClick={() => router.push("/login")}
              className="w-full rounded-xl py-3.5 font-semibold text-[#2E7D32] bg-[#FAF7F0] border border-[#C8E6C9] transition-all duration-200 hover:bg-white hover:border-[#2E7D32] hover:-translate-y-0.5 active:scale-[0.98] text-sm shadow-sm"
            >
              I already have an account
            </button>
          </div>
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
        
      `}</style>
    </div>
  );
}
