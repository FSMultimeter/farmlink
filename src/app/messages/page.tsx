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
  lastMessagePreview: string;
  isUnread: boolean;
}

function getPreview(text: string | undefined, wordCount = 4) {
  if (!text) return "No messages yet";
  const words = text.trim().split(/\s+/);
  const preview = words.slice(0, wordCount).join(" ");
  return words.length > wordCount ? `${preview}...` : preview;
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
          lastMessagePreview: getPreview(data.lastMessage),
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
                className={`flex items-center justify-between rounded-2xl shadow-md p-4 hover:shadow-lg transition ${
                  chat.isUnread ? "bg-white border-l-4 border-green-600" : "bg-white"
                }`}
              >
                <div>
                  <p
                    className={
                      chat.isUnread
                        ? "font-bold text-green-900"
                        : "font-medium text-gray-700"
                    }
                  >
                    {chat.otherPartyName}
                  </p>
                  <p className="text-xs text-gray-500 mb-0.5">About: {chat.cropName}</p>
                  <p
                    className={
                      chat.isUnread
                        ? "font-bold text-green-800 text-sm"
                        : "font-normal text-gray-500 text-sm"
                    }
                  >
                    {chat.lastMessagePreview}
                  </p>
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
