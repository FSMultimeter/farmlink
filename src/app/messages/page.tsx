"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface ChatSummary {
  id: string;
  cropName: string;
  otherPartyName: string;
  lastMessageAt: string | null;
  isUnread: boolean;
}

export default function MessagesPage() {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"farmer" | "company" | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const userDoc = await getDoc(doc(db, "Users", user.uid));
      const userRole = userDoc.exists() ? userDoc.data().role : null;
      setRole(userRole);

      const fieldName = userRole === "farmer" ? "farmerId" : "companyId";
      const q = query(collection(db, "Chats"), where(fieldName, "==", user.uid));
      const snapshot = await getDocs(q);

      const results: ChatSummary[] = [];

      for (const chatDoc of snapshot.docs) {
        const data = chatDoc.data();
        const otherPartyId = userRole === "farmer" ? data.companyId : data.farmerId;

        let otherPartyName = userRole === "farmer" ? "Company" : "Farmer";
        try {
          const otherUserDoc = await getDoc(doc(db, "Users", otherPartyId));
          if (otherUserDoc.exists()) {
            otherPartyName = otherUserDoc.data().name || otherPartyName;
          }
        } catch {}

        const lastReadField = userRole === "farmer" ? "lastReadFarmerAt" : "lastReadCompanyAt";
        const lastRead = data[lastReadField];
        const isUnread = data.lastMessageAt && (!lastRead || data.lastMessageAt > lastRead);

        results.push({
          id: chatDoc.id,
          cropName: data.cropName || "Unknown crop",
          otherPartyName,
          lastMessageAt: data.lastMessageAt,
          isUnread,
        });
      }

      results.sort((a, b) => {
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return a.lastMessageAt < b.lastMessageAt ? 1 : -1;
      });

      setChats(results);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const backHref = role === "farmer" ? "/farmer/dashboard" : "/company/dashboard";

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-800">Messages</h1>
          <a href={backHref} className="text-green-700 font-medium text-sm">
            ← Back to Dashboard
          </a>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : chats.length === 0 ? (
          <p className="text-gray-500">No conversations yet.</p>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <a
                key={chat.id}
                href={`/chat/${chat.id}`}
                className="flex items-center justify-between bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition"
              >
                <div>
                  <p className="font-bold text-green-800">{chat.otherPartyName}</p>
                  <p className="text-sm text-gray-600">About: {chat.cropName}</p>
                </div>
                {chat.isUnread && (
                  <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
