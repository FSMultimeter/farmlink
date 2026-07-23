"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function FarmerDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [activeListings, setActiveListings] = useState(0);
  const [pendingOffers, setPendingOffers] = useState(0);
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
        setUserName(userDoc.data().name);
      }

      const cropsQuery = query(
        collection(db, "Crops"),
        where("farmerId", "==", user.uid),
        where("status", "==", "available")
      );
      const cropsSnap = await getDocs(cropsQuery);
      setActiveListings(cropsSnap.size);

      const offersQuery = query(
        collection(db, "Offers"),
        where("farmerId", "==", user.uid),
        where("status", "==", "pending")
      );
      const offersSnap = await getDocs(offersQuery);
      setPendingOffers(offersSnap.size);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f6f9f0] via-[#eef4e2] to-[#e2edd0]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#cfdcb8] border-t-[#1f6b2f] animate-spin" />
          <p className="text-[#4f6b3f] text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { href: "/farmer/add-crop", label: "Add Crop", icon: "M12 4v16m8-8H4" },
    { href: "/farmer/my-listings", label: "My Listings", icon: "M4 6h16M4 12h16M4 18h7" },
    { href: "/farmer/ai-advisor", label: "AI Advisor", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    { href: "/farmer/profile", label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 0116 0" },
    { href: "/farmer/offers", label: "Offers", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6f9f0] via-[#eef4e2] to-[#e2edd0] px-4 py-8">
      <div className="max-w-4xl mx-auto fade-slide-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-[#4f6b3f] text-sm">Welcome back</p>
            <h1 className="text-2xl font-bold text-[#243a1a] tracking-tight">{userName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/farmer/notifications"
              className="relative bg-white/80 backdrop-blur-sm border border-[#dde4c8] text-[#1f6b2f] p-3 rounded-xl hover:bg-white hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 bg-[#c9573f] text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              ) : null}
            </a>
            <button
              onClick={handleLogout}
              className="bg-white/80 backdrop-blur-sm border border-[#dde4c8] text-[#1f6b2f] px-4 py-3 rounded-xl font-medium hover:bg-white hover:-translate-y-0.5 transition-all duration-200 shadow-sm text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white/85 backdrop-blur-sm border border-[#e0e6d0] rounded-2xl shadow-md p-6 hover:-translate-y-1 transition-transform duration-200">
            <p className="text-[#7a8368] text-sm">My Active Listings</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-[#1f6b2f] to-[#5a9a4a] bg-clip-text text-transparent mt-1">
              {activeListings}
            </p>
          </div>
          <div className="bg-white/85 backdrop-blur-sm border border-[#e0e6d0] rounded-2xl shadow-md p-6 hover:-translate-y-1 transition-transform duration-200">
            <p className="text-[#7a8368] text-sm">Pending Offers</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-[#1f6b2f] to-[#5a9a4a] bg-clip-text text-transparent mt-1">
              {pendingOffers}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group bg-white/85 backdrop-blur-sm border border-[#e0e6d0] rounded-2xl shadow-sm p-5 text-center hover:-translate-y-1 hover:shadow-lg hover:border-[#a9c98a] transition-all duration-200"
            >
              <div className="mx-auto mb-2 w-10 h-10 rounded-xl bg-gradient-to-br from-[#1f6b2f] to-[#5a9a4a] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <p className="font-medium text-[#243a1a] text-sm">{item.label}</p>
            </a>
          ))}
        </div>
      </div>

      <style jsx>{`
        .fade-slide-in {
          animation: fadeSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
