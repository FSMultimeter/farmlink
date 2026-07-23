"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

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
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-green-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-800">Settings</h1>
          <a href="/company/dashboard" className="text-green-700 font-medium text-sm">
            Back
          </a>
        </div>

        {message ? (
          <p className="bg-green-100 text-green-700 text-sm p-3 rounded mb-4">
            {message}
          </p>
        ) : null}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!editing}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!editing}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buying Rates (notes)
            </label>
            <textarea
              value={buyingRates}
              onChange={(e) => setBuyingRates(e.target.value)}
              disabled={!editing}
              rows={3}
              placeholder="e.g. Wheat: PKR 4800/40kg"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
            />
          </div>

          {editing ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full bg-white border border-green-600 text-green-700 py-2 rounded-lg font-medium hover:bg-green-100 transition"
            >
              Edit Settings
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
