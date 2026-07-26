"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface Message {
  id: string;
  senderId: string;
  senderRole: "farmer" | "company";
  text: string;
  createdAt: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.chatId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState<"farmer" | "company" | null>(null);
  const [otherPartyLabel, setOtherPartyLabel] = useState("");
  const [cropName, setCropName] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const [cropId, companyId] = chatId.split("_");
      const chatRef = doc(db, "Chats", chatId);
      const chatSnap = await getDoc(chatRef);

      let farmerId: string;
      let resolvedCropName = "";

      if (chatSnap.exists()) {
        const data = chatSnap.data();
        farmerId = data.farmerId;
        resolvedCropName = data.cropName || "";
      } else {
        // Chat doesn't exist yet — look up the crop to get farmerId, then create it
        const cropSnap = await getDoc(doc(db, "Crops", cropId));
        if (!cropSnap.exists()) {
          setLoading(false);
          return;
        }
        const cropData = cropSnap.data();
        farmerId = cropData.farmerId;
        resolvedCropName = cropData.cropName || "";

        await setDoc(chatRef, {
          cropId,
          companyId,
          farmerId,
          cropName: resolvedCropName,
          lastMessage: "",
          lastMessageAt: null,
          lastReadFarmerAt: null,
          lastReadCompanyAt: null,
          createdAt: new Date().toISOString(),
        });
      }

      const role: "farmer" | "company" = user.uid === farmerId ? "farmer" : "company";
      setMyRole(role);
      setOtherPartyLabel(role === "farmer" ? "Company" : "Farmer");
      setCropName(resolvedCropName);

      // Mark as read for this user
      await updateDoc(chatRef, {
        [role === "farmer" ? "lastReadFarmerAt" : "lastReadCompanyAt"]: new Date().toISOString(),
      });

      // Listen to messages in real time
      const messagesQuery = query(
        collection(db, "Chats", chatId, "Messages"),
        orderBy("createdAt", "asc")
      );
      const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
        const msgs: Message[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Message[];
        setMessages(msgs);
        setLoading(false);
      });

      return () => unsubMessages();
    });

    return () => unsubscribe();
  }, [chatId, router]);

  const handleSend = async () => {
    if (!input.trim() || !myRole) return;
    const user = auth.currentUser;
    if (!user) return;

    const text = input;
    setInput("");

    await addDoc(collection(db, "Chats", chatId, "Messages"), {
      senderId: user.uid,
      senderRole: myRole,
      text,
      createdAt: new Date().toISOString(),
    });

    const now = new Date().toISOString();
    await updateDoc(doc(db, "Chats", chatId), {
      lastMessage: text,
      lastMessageAt: now,
      [myRole === "farmer" ? "lastReadFarmerAt" : "lastReadCompanyAt"]: now,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const backHref = myRole === "farmer" ? "/farmer/offers" : "/company/dashboard";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-green-700">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold text-green-800">Chat with {otherPartyLabel}</h1>
            {cropName && <p className="text-sm text-gray-600">About: {cropName}</p>}
          </div>
          <a href={backHref} className="text-green-700 font-medium text-sm">
            ← Back
          </a>
        </div>

        <div
          className="flex-1 bg-white rounded-2xl shadow-md p-4 overflow-y-auto mb-4 space-y-3"
          style={{ maxHeight: "60vh" }}
        >
          {messages.length === 0 ? (
            <p className="text-gray-400 text-sm text-center mt-8">
              No messages yet. Say hello 👋
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderRole === myRole ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    msg.senderRole === myRole
                      ? "bg-green-600 text-white"
                      : "bg-green-100 text-green-900"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSend}
            className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
