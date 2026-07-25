"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import WheatBackground from "@/components/WheatBackground";

export default function CompanyProfile() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "Users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setCompanyName(data.name || "");
        setEmail(data.email || user.email || "");
        setPhone(data.phone || "");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <WheatBackground className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#C8E6C9] border-t-[#2E7D32] animate-spin" />
          <p className="text-[#2E7D32] font-medium text-sm animate-pulse">Loading profile...</p>
        </div>
      </WheatBackground>
    );
  }

  return (
    <WheatBackground className="px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243A1A] tracking-tight">
            Company Profile
          </h1>
          <a
            href="/company/dashboard"
            className="text-[#2E7D32] font-semibold text-sm hover:text-[#1F6B2F] transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>

        <div className="bg-white/85 backdrop-blur-md border border-[#E0E6D0] rounded-3xl shadow-xl shadow-[#2E7D32]/10 p-8 sm:p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] flex items-center justify-center shadow-md shadow-[#2E7D32]/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#243A1A]">{companyName || "Company"}</h2>
              <p className="text-[#6C755D] text-sm">{email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5A6C4D] mb-1.5">
                Company Name
              </label>
              <div className="bg-[#FAF7F0] border border-[#DDE4C8] rounded-xl px-4 py-3 text-[#243A1A] text-sm">
                {companyName || "—"}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5A6C4D] mb-1.5">
                Email
              </label>
              <div className="bg-[#FAF7F0] border border-[#DDE4C8] rounded-xl px-4 py-3 text-[#243A1A] text-sm">
                {email || "—"}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5A6C4D] mb-1.5">
                Phone
              </label>
              <div className="bg-[#FAF7F0] border border-[#DDE4C8] rounded-xl px-4 py-3 text-[#243A1A] text-sm">
                {phone || "—"}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <a
              href="/company/settings"
              className="flex-1 text-center rounded-xl py-3 font-semibold text-[#2E7D32] bg-[#FAF7F0] border border-[#C8E6C9] transition-all duration-200 hover:bg-white hover:border-[#2E7D32] text-sm"
            >
              Edit in Settings
            </a>
            <button
              onClick={handleLogout}
              className="flex-1 rounded-xl py-3 font-semibold text-white bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] shadow-md shadow-[#2E7D32]/30 transition-all duration-200 hover:scale-[1.02] text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </WheatBackground>
  );
}
