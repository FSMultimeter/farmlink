"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Crop {
  cropName: string;
  quantity: string;
  district: string;
  askingPrice: string;
  imageUrl: string;
  status: string;
  farmerId: string;
}

export default function CropDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [crop, setCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrop = async () => {
      const cropDoc = await getDoc(doc(db, "Crops", id));
      if (cropDoc.exists()) {
        setCrop(cropDoc.data() as Crop);
      }
      setLoading(false);
    };

    fetchCrop();
  }, [id]);

  if (loading) {
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
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
        {crop.imageUrl ? (
          <img src={crop.imageUrl} alt={crop.cropName} className="w-full h-56 object-cover" />
        ) : (
          <div className="w-full h-56 bg-green-100 flex items-center justify-center text-green-600">
            No Photo
          </div>
        )}

        <div className="p-6">
          <a href="/company/browse" className="text-green-700 text-sm font-medium">
            ← Back to Browse
          </a>

          <h1 className="text-2xl font-bold text-green-800 mt-3">{crop.cropName}</h1>
          <p className="text-gray-600 mt-1">{crop.quantity} kg available</p>
          <p className="text-gray-600">{crop.district}</p>
          <p className="text-2xl font-bold text-green-700 mt-3">PKR {crop.askingPrice}</p>

          <a
            href={`/company/make-offer/${id}`}
            className="block text-center w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition mt-6"
          >
            Make Offer
          </a>
        </div>
      </div>
    </div>
  );
}
