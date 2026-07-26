"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import WheatBackground from "@/components/WheatBackground";

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
      <WheatBackground className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#C8E6C9] border-t-[#2E7D32] animate-spin" />
          <p className="text-[#2E7D32] font-medium text-sm animate-pulse">Loading dashboard...</p>
        </div>
      </WheatBackground>
    );
  }

  const toolCards = [
    {
      href: "/company/browse",
      label: "Browse Crops",
      desc: "Explore fresh crops listed by local farmers",
      icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
      gradient: "from-[#1F6B2F] to-[#4CAF50]",
      badge: null,
    },
    {
      href: "/company/notifications",
      label: "Notifications",
      desc: "Stay updated on offer statuses & alerts",
      icon: "M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
      gradient: "from-[#2E7D32] to-[#66BB6A]",
      badge: unreadCount > 0 ? `${unreadCount} New` : null,
    },
    {
      href: "/company/profile",
      label: "Profile",
      desc: "View and manage your company account",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 0116 0",
      gradient: "from-[#388E3C] to-[#81C784]",
      badge: null,
    },
    {
      href: "/company/ai-advisor",
      label: "AI Advisor",
      desc: "Get sourcing and pricing guidance",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      gradient: "from-[#2E7D32] to-[#66BB6A]",
      badge: null,
    },
    {
      href: "/company/settings",
      label: "Settings",
      desc: "Manage company details & buying rates",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
      gradient: "from-[#1B5E20] to-[#388E3C]",
      badge: null,
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-[#6C755D] text-xs font-semibold uppercase tracking-wider">Company Portal</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243A1A] tracking-tight">
                Welcome, {companyName || "Company"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/messages"
              className="relative group bg-[#FAF7F0] border border-[#C8E6C9] text-[#2E7D32] p-3 rounded-2xl hover:bg-[#E8F5E9] hover:border-[#2E7D32] transition-all duration-200 shadow-sm hover:scale-105"
              title="Messages"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform group-hover:rotate-12 duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </a>

            <a
              href="/company/notifications"
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
          {/* Stat 1: Offers Sent */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#E8F5E9] via-[#F1F8E9] to-[#C8E6C9] border border-[#A5D6A7] rounded-3xl p-6 sm:p-7 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#2E7D32]/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs font-semibold text-[#2E7D32] mb-2 border border-[#C8E6C9]">
                  Procurement Activity
                </span>
                <p className="text-[#4A5D3E] text-sm font-medium">Offers Sent</p>
                <p className="text-4xl sm:text-5xl font-extrabold text-[#2E7D32] tracking-tight mt-1">
                  {offersSent}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/90 shadow-md flex items-center justify-center text-[#2E7D32] group-hover:scale-110 transition-transform duration-300 border border-[#A5D6A7]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
            </div>
          </div>

          {/* Stat 2: Accepted Offers */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#E8F5E9] via-[#F4F8EC] to-[#DCEDC8] border border-[#C5E1A5] rounded-3xl p-6 sm:p-7 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#4CAF50]/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs font-semibold text-[#1B5E20] mb-2 border border-[#C5E1A5]">
                  Successful Deals
                </span>
                <p className="text-[#4A5D3E] text-sm font-medium">Accepted Offers</p>
                <p className="text-4xl sm:text-5xl font-extrabold text-[#1B5E20] tracking-tight mt-1">
                  {acceptedOffers}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/90 shadow-md flex items-center justify-center text-[#1B5E20] group-hover:scale-110 transition-transform duration-300 border border-[#C5E1A5]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tool Cards Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#243A1A] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
              Management Tools
            </h2>
            <span className="text-xs text-[#6C755D] font-medium">5 Actions Available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {toolCards.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group relative bg-white/85 backdrop-blur-md border border-[#E0E6D0] rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-[#4CAF50] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-md text-white group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    {item.badge ? (
                      <span className="px-2.5 py-1 bg-[#C9573F] text-white text-xs font-bold rounded-full shadow-sm animate-pulse">
                        {item.badge}
                      </span>
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E0E6D0] flex items-center justify-center text-[#2E7D32] group-hover:bg-[#2E7D32] group-hover:text-white transition-all duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    )}
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
