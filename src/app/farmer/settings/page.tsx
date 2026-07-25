"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import WheatBackground from "@/components/WheatBackground";

export default function FarmerSettingsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
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
        setDistrict(data.district || "");
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
        name,
        phone,
        district,
      });
      setMessage("Settings updated successfully.");
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

  const fields = [
    { id: "name", label: "Full Name", value: name, setter: setName, editable: true, type: "text" },
    { id: "email", label: "Email", value: email, setter: null, editable: false, type: "email" },
    { id: "phone", label: "Phone", value: phone, setter: setPhone, editable: true, type: "text" },
    { id: "district", label: "District", value: district, setter: setDistrict, editable: true, type: "text" },
  ];

  return (
    <WheatBackground className="px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-md border border-[#E0E6D0] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#33691E] to-[#8BC34A] flex items-center justify-center shadow-md shadow-[#33691E]/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </div>
            <div>
              <p className="text-[#6C755D] text-xs font-semibold uppercase tracking-wider">Farmer Portal</p>
              <h1 className="text-2xl font-extrabold text-[#243A1A] tracking-tight">Settings</h1>
            </div>
          </div>
          <a
            href="/farmer/dashboard"
            className="flex items-center gap-2 bg-[#FAF7F0] border border-[#C8E6C9] text-[#2E7D32] px-4 py-2.5 rounded-2xl font-semibold hover:bg-[#E8F5E9] hover:border-[#2E7D32] transition-all duration-200 shadow-sm text-sm hover:-translate-y-0.5"
          >
            Back
          </a>
        </div>

        {message ? (
          <div className="bg-[#E8F5E9] border border-[#A5D6A7] text-[#2E7D32] text-sm font-medium p-4 rounded-2xl">
            {message}
          </div>
        ) : null}

        <div className="bg-white/85 backdrop-blur-md border border-[#E0E6D0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          {fields.map((field) => (
            <div key={field.id}>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#6C755D] mb-2">
                {field.label}
              </label>
              <input
                type={field.type}
                value={field.value}
                onChange={(e) => field.setter && field.setter(e.target.value)}
                disabled={!field.editable || !editing}
                className="w-full bg-[#FAF7F0] border border-[#E0E6D0] text-[#243A1A] rounded-2xl px-4 py-3 outline-none transition-all duration-200 focus:border-[#2E7D32] focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          ))}

          {editing ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] text-white py-3 rounded-2xl font-semibold shadow-md shadow-[#2E7D32]/20 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full bg-[#FAF7F0] border border-[#C8E6C9] text-[#2E7D32] py-3 rounded-2xl font-semibold hover:bg-[#E8F5E9] hover:border-[#2E7D32] transition-all duration-200"
            >
              Edit Settings
            </button>
          )}
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
