"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Crop {
  id: string;
  cropName: string;
  quantity: string;
  district: string;
  askingPrice: string;
  imageUrl: string;
  status: string;
}

export default function BrowseCropsPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");

  useEffect(() => {
    const fetchCrops = async () => {
      const q = query(collection(db, "Crops"), where("status", "==", "available"));
      const snapshot = await getDocs(q);
      const cropList: Crop[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Crop[];
      setCrops(cropList);
      setLoading(false);
    };

    fetchCrops();
  }, []);

  const filteredCrops = crops.filter((crop) => {
    const matchesSearch = crop.cropName.toLowerCase().includes(search.toLowerCase());
    const matchesDistrict = districtFilter
      ? crop.district.toLowerCase().includes(districtFilter.toLowerCase())
      : true;
    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-800">Browse Crops</h1>
          <a href="/company/dashboard" className="text-green-700 font-medium text-sm">
            ← Back to Dashboard
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search crop name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Filter by district..."
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : filteredCrops.length === 0 ? (
          <p className="text-gray-500">No crops match your search.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredCrops.map((crop) => (
              <a
                key={crop.id}
                href={`/company/crop/${crop.id}`}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition"
              >
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
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
