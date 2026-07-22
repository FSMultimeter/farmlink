"use client";

import { useState, useRef, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface Message {
  role: "user" | "ai";
  text: string;
}

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Hello! Ask me anything about crop health, fertilizers, irrigation, or pest management." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const question = input;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      const answer = data.answer || "Sorry, something went wrong.";

      setMessages((prev) => [...prev, { role: "ai", text: answer }]);

      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "AIHistory"), {
          farmerId: user.uid,
          question,
          response: answer,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-green-800">AI Crop Advisor</h1>
          <a href="/farmer/dashboard" className="text-green-700 font-medium text-sm">
            ← Back
          </a>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-md p-4 overflow-y-auto mb-4 space-y-3" style={{ maxHeight: "60vh" }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                  msg.role === "user"
                    ? "bg-green-600 text-white"
                    : "bg-green-100 text-green-900"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-green-100 text-green-900 px-4 py-2 rounded-2xl text-sm">
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about crop health, fertilizer, irrigation..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
