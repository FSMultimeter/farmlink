"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import WheatBackground from "@/components/WheatBackground";

export default function CompanySettingsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [buyingRates, setBuyingRates] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "Users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setBuyingRates(data.buyingRates || "");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    setMessage("");

    try {
      await updateDoc(doc(db, "Users", user.uid), {
        name: name,
        phone: phone,
        buyingRates: buyingRates,
      });
      setMessage("Settings updated successfully!");
      setEditing(false);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <WheatBackground className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#C8E6C9] border-t-[#2E7D32] animate-spin" />
          <p className="text-[#2E7D32] font-medium text-sm animate-pulse">Loading settings...</p>
        </div>
      </WheatBackground>
    );
  }

  return (
    <WheatBackground className="px-4 py-8 sm:py-12">
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <a
            href="/company/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2E7D32] bg-white/80 backdrop-blur-sm border border-[#C8E6C9] px-4 py-2 rounded-xl hover:bg-[#E8F5E9] hover:border-[#2E7D32] transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </a>

          <span className="text-xs text-[#6C755D] font-medium px-3 py-1 bg-white/60 rounded-full border border-[#E0E6D0]">
            Profile Preferences
          </span>
        </div>

        {/* Main Settings Card */}
        <div className="bg-white/90 backdrop-blur-md border border-[#E0E6D0] rounded-3xl shadow-xl p-6 sm:p-10 space-y-6">
          <div className="flex items-start justify-between pb-4 border-b border-[#E0E6D0]">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243A1A] tracking-tight">
                Company Settings
              </h1>
              <p className="text-[#6C755D] text-sm mt-1">
                Manage your business info and buying parameters
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] flex items-center justify-center shadow-md text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </div>
          </div>

          {message && (
            <div className="flex items-center gap-3 bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E7D32] text-sm p-4 rounded-2xl animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{message}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Field 1: Company Name */}
            <div>
              <label className="block text-sm font-semibold text-[#243A1A] mb-1.5">
                Company Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-[#6C755D]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!editing}
                  className="w-full bg-[#FAF7F0] border border-[#DDE4C8] text-[#243A1A] rounded-xl pl-11 pr-4 py-3 outline-none transition-all duration-200 focus:border-[#2E7D32] focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 disabled:bg-[#F3F0E6] disabled:text-[#6C755D] disabled:cursor-not-allowed text-sm font-medium shadow-inner"
                />
              </div>
            </div>

            {/* Field 2: Email */}
            <div>
              <label className="block text-sm font-semibold text-[#243A1A] mb-1.5 flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-xs text-[#6C755D] font-normal">(Primary account ID)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-[#6C755D]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-[#F3F0E6] border border-[#DDE4C8] text-[#6C755D] rounded-xl pl-11 pr-4 py-3 cursor-not-allowed text-sm font-medium"
                />
              </div>
            </div>

            {/* Field 3: Phone */}
            <div>
              <label className="block text-sm font-semibold text-[#243A1A] mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-[#6C755D]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!editing}
                  placeholder="+92 300 1234567"
                  className="w-full bg-[#FAF7F0] border border-[#DDE4C8] text-[#243A1A] rounded-xl pl-11 pr-4 py-3 outline-none transition-all duration-200 focus:border-[#2E7D32] focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 disabled:bg-[#F3F0E6] disabled:text-[#6C755D] disabled:cursor-not-allowed text-sm font-medium shadow-inner"
                />
              </div>
            </div>

            {/* Field 4: Buying Rates */}
            <div>
              <label className="block text-sm font-semibold text-[#243A1A] mb-1.5 flex items-center justify-between">
                <span>Buying Rates & Procurement Notes</span>
                <span className="text-xs text-[#6C755D] font-normal">Visible on offer details</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-[#6C755D]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10M7 11h10M7 15h5" />
                  </svg>
                </span>
                <textarea
                  value={buyingRates}
                  onChange={(e) => setBuyingRates(e.target.value)}
                  disabled={!editing}
                  rows={4}
                  placeholder="e.g. Wheat: PKR 4800/40kg, Cotton: PKR 8500/40kg (Subject to quality check)"
                  className="w-full bg-[#FAF7F0] border border-[#DDE4C8] text-[#243A1A] rounded-xl pl-11 pr-4 py-3 outline-none transition-all duration-200 focus:border-[#2E7D32] focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 disabled:bg-[#F3F0E6] disabled:text-[#6C755D] disabled:cursor-not-allowed text-sm font-medium shadow-inner leading-relaxed resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              {editing ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 bg-white border border-[#DDE4C8] text-[#6C755D] py-3.5 rounded-xl font-semibold hover:bg-[#FAF7F0] transition-all duration-200 text-sm shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 group relative overflow-hidden bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-[#2E7D32]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 text-sm flex items-center justify-center gap-2"
                  >
                    {saving && (
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                    )}
                    {saving ? "Saving Changes..." : "Save Settings"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-[#2E7D32]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Settings
                </button>
              )}
            </div>
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
