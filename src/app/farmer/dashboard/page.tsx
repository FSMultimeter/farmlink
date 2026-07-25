"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import WheatBackground from "@/components/WheatBackground";

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
      <WheatBackground className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#C8E6C9] border-t-[#2E7D32] animate-spin" />
          <p className="text-[#2E7D32] font-medium text-sm animate-pulse">Loading dashboard...</p>
        </div>
      </WheatBackground>
    );
  }

  const menuItems = [
    {
      href: "/farmer/add-crop",
      label: "Add Crop",
      desc: "List new harvest for sale",
      icon: "M12 4v16m8-8H4",
      gradient: "from-[#1F6B2F] to-[#4CAF50]",
      bgBadge: "bg-[#E8F5E9]",
    },
    {
      href: "/farmer/my-listings",
      label: "My Listings",
      desc: "Manage your active crop posts",
      icon: "M4 6h16M4 12h16M4 18h7",
      gradient: "from-[#1B5E20] to-[#2E7D32]",
      bgBadge: "bg-[#E8F5E9]",
    },
    {
      href: "/farmer/ai-advisor",
      label: "AI Advisor",
      desc: "Get crop price & yield insights",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      gradient: "from-[#2E7D32] to-[#66BB6A]",
      bgBadge: "bg-[#E8F5E9]",
    },
    {
      href: "/farmer/profile",
      label: "Profile",
      desc: "Update farm details & contact info",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 0116 0",
      gradient: "from-[#388E3C] to-[#81C784]",
      bgBadge: "bg-[#E8F5E9]",
    },
    {
      href: "/farmer/offers",
      label: "Offers",
      desc: "Review buyer bids & deals",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      gradient: "from-[#2E7D32] to-[#43A047]",
      bgBadge: "bg-[#E8F5E9]",
    },
    {
      href: "/farmer/settings",
      label: "Settings",
      desc: "Manage account & preferences",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
      gradient: "from-[#33691E] to-[#8BC34A]",
      bgBadge: "bg-[#E8F5E9]",
    },
  ];

  return (
    <WheatBackground className="px-4 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E0E6D0] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] flex items-center justify-center shadow-md shadow-[#2E7D32]/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V7.5M12 21a9 9 0 100-18 9 9 0 000 18z" />
              </svg>
            </div>
            <div>
              <p className="text-[#6C755D] text-xs font-semibold uppercase tracking-wider">Farmer Portal</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243A1A] tracking-tight">
                Welcome, {userName || "Farmer"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/farmer/notifications"
              className="relative group bg-[#FAF7F0] border border-[#C8E6C9] text-[#2E7D32] p-3 rounded-2xl hover:bg-[#E8F5E9] hover:border-[#2E7D32] transition-all duration-200 shadow-sm hover:scale-105"
              title="Notifications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform group-hover:rotate-12 duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#C9573F] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </a>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-[#FAF7F0] border border-[#C8E6C9] text-[#2E7D32] px-5 py-2.5 rounded-2xl font-semibold hover:bg-[#E8F5E9] hover:border-[#2E7D32] transition-all duration-200 shadow-sm text-sm hover:-translate-y-0.5 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Stat Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Stat 1: Active Listings */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#E8F5E9] via-[#F1F8E9] to-[#C8E6C9] border border-[#A5D6A7] rounded-3xl p-6 sm:p-7 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#2E7D32]/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs font-semibold text-[#2E7D32] mb-2 border border-[#C8E6C9]">
                  Harvest Inventory
                </span>
                <p className="text-[#4A5D3E] text-sm font-medium">My Active Listings</p>
                <p className="text-4xl sm:text-5xl font-extrabold text-[#2E7D32] tracking-tight mt-1">
                  {activeListings}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/90 shadow-md flex items-center justify-center text-[#2E7D32] group-hover:scale-110 transition-transform duration-300 border border-[#A5D6A7]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          {/* Stat 2: Pending Offers */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#E8F5E9] via-[#F4F8EC] to-[#DCEDC8] border border-[#C5E1A5] rounded-3xl p-6 sm:p-7 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#4CAF50]/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs font-semibold text-[#1B5E20] mb-2 border border-[#C5E1A5]">
                  Buyer Interest
                </span>
                <p className="text-[#4A5D3E] text-sm font-medium">Pending Offers</p>
                <p className="text-4xl sm:text-5xl font-extrabold text-[#1B5E20] tracking-tight mt-1">
                  {pendingOffers}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/90 shadow-md flex items-center justify-center text-[#1B5E20] group-hover:scale-110 transition-transform duration-300 border border-[#C5E1A5]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Tool Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#243A1A] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
              Quick Actions & Tools
            </h2>
            <span className="text-xs text-[#6C755D] font-medium">5 Services Available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group relative bg-white/85 backdrop-blur-md border border-[#E0E6D0] rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-[#4CAF50] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-md text-white group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E0E6D0] flex items-center justify-center text-[#2E7D32] group-hover:bg-[#2E7D32] group-hover:text-white transition-all duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>

                  <h3 className="font-bold text-[#243A1A] text-lg group-hover:text-[#2E7D32] transition-colors mb-1">
                    {item.label}
                  </h3>
                  <p className="text-[#6C755D] text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </a>
            ))}
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
