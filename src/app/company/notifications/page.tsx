"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import WheatBackground from "@/components/WheatBackground";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const q = query(
        collection(db, "Notifications"),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(q);

      const list: Notification[] = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Notification)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

      setNotifications(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, "Notifications", id), { read: true });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <WheatBackground className="px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-md border border-[#E0E6D0] rounded-3xl p-6 shadow-sm">
          <div>
            <span className="text-xs text-[#6C755D] font-semibold uppercase tracking-wider">Company Feed</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243A1A] tracking-tight mt-0.5">
              Notifications
            </h1>
          </div>

          <a
            href="/company/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2E7D32] bg-[#FAF7F0] border border-[#C8E6C9] px-4 py-2.5 rounded-2xl hover:bg-[#E8F5E9] hover:border-[#2E7D32] transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </a>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl border border-[#E0E6D0]">
            <div className="w-10 h-10 rounded-full border-4 border-[#C8E6C9] border-t-[#2E7D32] animate-spin mb-3" />
            <p className="text-[#2E7D32] text-sm font-medium animate-pulse">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div className="bg-white/85 backdrop-blur-md border border-[#E0E6D0] rounded-3xl p-10 sm:p-14 text-center shadow-sm">
            <div className="w-20 h-20 bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E7D32] rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#243A1A] tracking-tight mb-2">All Caught Up!</h2>
            <p className="text-[#6C755D] text-sm max-w-sm mx-auto mb-6">
              You don&apos;t have any notifications right now. When farmers respond to your offers or post new crops, updates will appear here.
            </p>
            <a
              href="/company/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-[#2E7D32]/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
            >
              Return to Dashboard
            </a>
          </div>
        ) : (
          /* Notification Cards List */
          <div className="space-y-3">
            {notifications.map((n) => {
              const isAccepted = n.message.toLowerCase().includes("accept");
              const isOffer = n.message.toLowerCase().includes("offer");

              return (
                <div
                  key={n.id}
                  onClick={() => !n.read && markAsRead(n.id)}
                  className={`group relative overflow-hidden rounded-2xl p-5 border shadow-sm transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                    n.read
                      ? "bg-white/90 border-[#E0E6D0] hover:border-[#2E7D32]/40 hover:shadow-md hover:-translate-y-0.5"
                      : "bg-gradient-to-r from-[#E8F5E9]/90 to-[#F4F8EC] border-[#A5D6A7] border-l-4 border-l-[#2E7D32] shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  {/* Icon Square */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-110 ${
                      isAccepted
                        ? "bg-[#2E7D32] text-white"
                        : isOffer
                        ? "bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] text-white"
                        : "bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]"
                    }`}
                  >
                    {isAccepted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isOffer ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10M7 11h10M7 15h5" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    )}
                  </div>

                  {/* Body Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className={`text-sm leading-snug ${n.read ? "text-[#243A1A] font-medium" : "text-[#1B5E20] font-bold"}`}>
                        {n.message}
                      </p>
                      {!n.read && (
                        <span className="px-2 py-0.5 bg-[#2E7D32] text-white text-[10px] font-extrabold uppercase tracking-wide rounded-full flex-shrink-0">
                          New
                        </span>
                      )}
                    </div>
                    {n.createdAt && (
                      <p className="text-xs text-[#6C755D] font-medium flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTime(n.createdAt)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
