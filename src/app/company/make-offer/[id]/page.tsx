"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface Crop {
  cropName: string;
  farmerId: string;
  askingPrice: string;
}

export default function MakeOfferPage() {
  const params = useParams();
  const router = useRouter();
  const cropId = params.id as string;

  const [crop, setCrop] = useState<Crop | null>(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchCrop = async () => {
      const cropDoc = await getDoc(doc(db, "Crops", cropId));
      if (cropDoc.exists()) {
        setCrop(cropDoc.data() as Crop);
      }
      setPageLoading(false);
    };
    fetchCrop();
  }, [cropId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const user = auth.currentUser;
    if (!user || !crop) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "Offers"), {
        cropId,
        companyId: user.uid,
        farmerId: crop.farmerId,
        offerPrice,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      await addDoc(collection(db, "Notifications"), {
        userId: crop.farmerId,
        message: `You received a new offer of PKR ${offerPrice} on your ${crop.cropName} listing.`,
        read: false,
        createdAt: new Date().toISOString(),
      });

      router.push("/company/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-green-700">Loading...</p>
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-red-600">Crop not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-green-800 mb-2">Make an Offer</h1>
        <p className="text-gray-600 mb-6">
          For <span className="font-medium">{crop.cropName}</span> (Asking: PKR {crop.askingPrice})
        </p>

        {error && (
          <p className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Offer (PKR)</label>
            <input
              type="text"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Offer"}
          </button>
        </form>
      </div>
    </div>
  );
}
