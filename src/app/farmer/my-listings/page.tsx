"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface Crop {
  id: string;
  cropName: string;
  quantity: string;
  district: string;
  askingPrice: string;
  imageUrl: string;
  status: string;
}

export default function MyListingsPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const q = query(collection(db, "Crops"), where("farmerId", "==", user.uid));
      const snapshot = await getDocs(q);

      const cropList: Crop[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Crop[];

      setCrops(cropList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-800">My Listings</h1>
          <a
            href="/farmer/dashboard"
            className="text-green-700 font-medium text-sm"
          >
            ← Back to Dashboard
          </a>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : crops.length === 0 ? (
          <p className="text-gray-500">You haven't listed any crops yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {crops.map((crop) => (
              <div key={crop.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                {crop.imageUrl ? (
                  <img
                    src={crop.imageUrl}
                    alt={crop.cropName}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-green-100 flex items-center justify-center text-green-600">
                    No Photo
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-bold text-green-800">{crop.cropName}</h2>
                  <p className="text-sm text-gray-600">{crop.quantity} kg • {crop.district}</p>
                  <p className="text-green-700 font-medium mt-1">PKR {crop.askingPrice}</p>
                  <span
                    className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                      crop.status === "available"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {crop.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
