"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "Users", user.uid));
        if (userDoc.exists()) {
          const role = userDoc.data().role;
          router.push(role === "farmer" ? "/farmer/dashboard" : "/company/dashboard");
          return;
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-green-600 flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-white mb-2">FarmLink</h1>
      <p className="text-green-100 mb-10">
        Connecting farmers directly with verified buyers
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <a
          href="/login"
          className="bg-white text-green-700 py-3 rounded-lg font-medium hover:bg-green-50 transition"
        >
          Login
        </a>
        <a
          href="/register"
          className="bg-green-700 text-white py-3 rounded-lg font-medium border border-white hover:bg-green-800 transition"
        >
          Register
        </a>
      </div>
    </div>
  );
}
