"use client";

import React from "react";

interface WheatBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function WheatBackground({ children, className = "" }: WheatBackgroundProps) {
  return (
    <div className={`relative min-h-screen bg-[#FAF7F0] text-[#243A1A] overflow-x-hidden ${className}`}>
      {/* WhatsApp-Style Low-Opacity (6%) Repeating Farm & Crop Silhouette Doodle Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='140' height='140' viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%232E7D32' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3C!-- Farmer holding hoe --%3E%3Cpath d='M25 22 a3 3 0 1 0 0.1 0 M25 25 v12 M20 30 h10 M25 31 l8 8 M33 22 v20 M29 42 h8' /%3E%3C!-- Small tree --%3E%3Cpath d='M95 32 v12 M95 38 c-8-2-10-12 0-14 c10-2 14 8 0 14' fill='%234CAF50' fill-opacity='0.15' /%3E%3C!-- Wheat sheaf --%3E%3Cpath d='M20 90 c5-10 10-15 15-20 M35 70 c-5 10-10 15-15 20 M27.5 70 v22 M22 75 c2-3 5-3 7 0 M31 75 c2-3 5-3 7 0 M24 82 h7' /%3E%3C!-- Farmer pushing wheelbarrow --%3E%3Cpath d='M75 80 a3 3 0 1 0 0.1 0 M75 83 v10 M70 87 h10 M75 89 l10 3 M85 92 h12 l-3 8 h-8 z M97 97 a3 3 0 1 1-0.1 0' /%3E%3C!-- Crop rows --%3E%3Cpath d='M10 130 q15-6 30 0 t30 0 t30 0 t30 0' stroke-dasharray='3 3' /%3E%3C!-- Double leaf sprout --%3E%3Cpath d='M115 115 v10 M115 118 c-6-5-10 0 0 5 M115 118 c6-5 10 0 0 5' fill='%232E7D32' fill-opacity='0.2' /%3E%3C!-- Sun with rays --%3E%3Ccircle cx='60' cy='35' r='6' fill='%234CAF50' fill-opacity='0.2' /%3E%3Cpath d='M60 23 v4 M60 43 v4 M48 35 h4 M68 35 h4 M52 27 l3 3 M65 40 l3 3 M52 43 l3-3 M65 30 l3-3' /%3E%3C!-- Basket of harvest --%3E%3Cpath d='M120 40 h15 l-2 10 h-11 z M123 40 c0-4 9-4 9 0 M124 38 a2 2 0 1 0 0.1 0 M129 37 a2 2 0 1 0 0.1 0' /%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Decorative ambient gradient blobs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[#E8F5E9]/50 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-[#DCEDC8]/30 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Main Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
