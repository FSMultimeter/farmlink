"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function FarmerDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "Users", user.uid));
      if (userDoc.exists()) {
        setUserName(userDoc.data().name);
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
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-green-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-green-800">
            Welcome, {userName}
          </h1>
          <button
            onClick={handleLogout}
            className="bg-white border border-green-600 text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500 text-sm">My Active Listings</p>
            <p className="text-3xl font-bold text-green-700 mt-1">0</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500 text-sm">Pending Offers</p>
            <p className="text-3xl font-bold text-green-700 mt-1">0</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <a href="/farmer/add-crop" className="bg-white rounded-2xl shadow-md p-4 text-center hover:bg-green-100 transition">
            <p className="font-medium text-green-800">Add Crop</p>
          </a>
          <a href="/farmer/my-listings" className="bg-white rounded-2xl shadow-md p-4 text-center hover:bg-green-100 transition">
            <p className="font-medium text-green-800">My Listings</p>
          </a>
          <a href="/farmer/ai-advisor" className="bg-white rounded-2xl shadow-md p-4 text-center hover:bg-green-100 transition">
            <p className="font-medium text-green-800">AI Advisor</p>
          </a>
          <a href="/farmer/profile" className="bg-white rounded-2xl shadow-md p-4 text-center hover:bg-green-100 transition">
            <p className="font-medium text-green-800">Profile</p>
          </a><a href="/farmer/offers" className="bg-white rounded-2xl shadow-md p-4 text-center hover:bg-green-100 transition">
  <p className="font-medium text-green-800">Offers</p>
</a>

        </div>
      </div>
    </div>
  );
}
