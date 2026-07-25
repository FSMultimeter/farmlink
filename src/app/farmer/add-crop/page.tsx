"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import WheatBackground from "@/components/WheatBackground";

export default function AddCropPage() {
  const router = useRouter();
  const [cropName, setCropName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [district, setDistrict] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    try {
      let imageUrl = "";

      if (image) {
        const imageRef = ref(storage, `crops/${user.uid}_${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, "Crops"), {
        farmerId: user.uid,
        cropName,
        quantity,
        district,
        askingPrice: price,
        imageUrl,
        status: "available",
        createdAt: new Date().toISOString(),
      });

      setSuccess(true);
      setLoading(false);

      setTimeout(() => {
        router.push("/farmer/my-listings");
      }, 1200);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <WheatBackground className="px-4 py-8 sm:py-12">
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <a
            href="/farmer/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2E7D32] bg-white/80 backdrop-blur-sm border border-[#C8E6C9] px-4 py-2 rounded-xl hover:bg-[#E8F5E9] hover:border-[#2E7D32] transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </a>
          <span className="text-xs text-[#6C755D] font-medium px-3 py-1 bg-white/60 rounded-full border border-[#E0E6D0]">
            Harvest Post
          </span>
        </div>

        <div className="bg-white/90 backdrop-blur-md border border-[#E0E6D0] rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E0E6D0]">
            <div>
              <h1 className="text-2xl font-extrabold text-[#243A1A] tracking-tight">Add New Crop</h1>
              <p className="text-[#6C755D] text-xs mt-0.5">Publish your yield to buyers across the country</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] flex items-center justify-center text-white shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-2xl font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E7D32] text-sm p-4 rounded-2xl font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Crop listed successfully! Redirecting to listings...
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#243A1A] mb-1">Crop Name</label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="e.g. Basmati Rice, Cotton, Wheat"
                  required
                  className="w-full bg-[#FAF7F0] border border-[#DDE4C8] text-[#243A1A] rounded-xl px-4 py-3 outline-none transition-all focus:border-[#2E7D32] focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#243A1A] mb-1">Quantity (kg)</label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 5000"
                  required
                  className="w-full bg-[#FAF7F0] border border-[#DDE4C8] text-[#243A1A] rounded-xl px-4 py-3 outline-none transition-all focus:border-[#2E7D32] focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#243A1A] mb-1">District / Location</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Multan, Punjab"
                  required
                  className="w-full bg-[#FAF7F0] border border-[#DDE4C8] text-[#243A1A] rounded-xl px-4 py-3 outline-none transition-all focus:border-[#2E7D32] focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#243A1A] mb-1">Asking Price (PKR)</label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 4500 / 40kg"
                  required
                  className="w-full bg-[#FAF7F0] border border-[#DDE4C8] text-[#243A1A] rounded-xl px-4 py-3 outline-none transition-all focus:border-[#2E7D32] focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#243A1A] mb-1">Crop Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-[#6C755D] file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#E8F5E9] file:text-[#2E7D32] hover:file:bg-[#C8E6C9] file:cursor-pointer cursor-pointer border border-[#DDE4C8] rounded-xl bg-[#FAF7F0] p-1.5"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-[#2E7D32]/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2 mt-4"
              >
                {loading ? "Publishing Crop..." : "Publish Crop Listing"}
              </button>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </WheatBackground>
  );
}
