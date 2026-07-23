"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function FarmerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

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
  }, []);

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, "Notifications", id), { read: true });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-800">Notifications</h1>
          <a href="/farmer/dashboard" className="text-green-700 font-medium text-sm">
            Back to Dashboard
          </a>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-500">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && markAsRead(n.id)}
                className={`p-4 rounded-xl shadow-sm cursor-pointer transition ${
                  n.read ? "bg-white text-gray-600" : "bg-green-100 text-green-900 font-medium"
                }`}
              >
                {n.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
