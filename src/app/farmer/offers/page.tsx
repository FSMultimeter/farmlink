"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface Offer {
  id: string;
  cropId: string;
  companyId: string;
  offerPrice: string;
  status: string;
  createdAt: string;
  cropName?: string;
}

export default function OfferDetailsPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOffers = async (uid: string) => {
    const q = query(collection(db, "Offers"), where("farmerId", "==", uid));
    const snapshot = await getDocs(q);

    const offerList: Offer[] = await Promise.all(
      snapshot.docs.map(async (offerDoc) => {
        const data = offerDoc.data();
        let cropName = "Unknown crop";

        try {
          const cropSnap = await getDocs(
            query(collection(db, "Crops"), where("__name__", "==", data.cropId))
          );
          if (!cropSnap.empty) {
            cropName = cropSnap.docs[0].data().cropName;
          }
        } catch {}

        return {
          id: offerDoc.id,
          ...data,
          cropName,
        } as Offer;
      })
    );

    offerList.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    setOffers(offerList);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) loadOffers(user.uid);
    });
    return () => unsubscribe();
  }, []);

  const respondToOffer = async (offerId: string, newStatus: "accepted" | "rejected") => {
    await updateDoc(doc(db, "Offers", offerId), { status: newStatus });
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: newStatus } : o))
    );
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-800">Offers Received</h1>
          <a href="/farmer/dashboard" className="text-green-700 font-medium text-sm">
            Back to Dashboard
          </a>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : offers.length === 0 ? (
          <p className="text-gray-500">No offers yet.</p>
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-2xl shadow-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-green-800">{offer.cropName}</p>
                    <p className="text-green-700 font-medium">PKR {offer.offerPrice}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      offer.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : offer.status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {offer.status}
                  </span>
                </div>

                {offer.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => respondToOffer(offer.id, "accepted")}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respondToOffer(offer.id, "rejected")}
                      className="flex-1 bg-white border border-red-500 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
