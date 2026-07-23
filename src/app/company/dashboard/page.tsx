"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function CompanyDashboard() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [offersSent, setOffersSent] = useState(0);
  const [acceptedOffers, setAcceptedOffers] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "Users", user.uid));
      if (userDoc.exists()) {
        setCompanyName(userDoc.data().name);
      }

      const offersQuery = query(
        collection(db, "Offers"),
        where("companyId", "==", user.uid)
      );
      const offersSnap = await getDocs(offersQuery);
      setOffersSent(offersSnap.size);

      const acceptedQuery = query(
        collection(db, "Offers"),
        where("companyId", "==", user.uid),
        where("status", "==", "accepted")
      );
      const acceptedSnap = await getDocs(acceptedQuery);
      setAcceptedOffers(acceptedSnap.size);

      const notifQuery = query(
        collection(db, "Notifications"),
        where("userId", "==", user.uid),
        where("read", "==", false)
      );
      const notifSnap = await getDocs(notifQuery);
      setUnreadCount(notifSnap.size);

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
            Welcome, {companyName}
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
            <p className="text-gray-500 text-sm">Offers Sent</p>
            <p className="text-3xl font-bold text-green-700 mt-1">{offersSent}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500 text-sm">Accepted Offers</p>
            <p className="text-3xl font-bold text-green-700 mt-1">{acceptedOffers}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <a href="/company/browse" className="bg-white rounded-2xl shadow-md p-4 text-center hover:bg-green-100 transition">
            <p className="font-medium text-green-800">Browse Crops</p>
          </a>
          <a href="/company/notifications" className="relative bg-white rounded-2xl shadow-md p-4 text-center hover:bg-green-100 transition">
            <p className="font-medium text-green-800">Notifications</p>
            {unreadCount > 0 ? (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            ) : null}
          </a>
          <a href="/company/settings" className="bg-white rounded-2xl shadow-md p-4 text-center hover:bg-green-100 transition">
            <p className="font-medium text-green-800">Settings</p>
          </a>
        </div>
      </div>
    </div>
  );
}
