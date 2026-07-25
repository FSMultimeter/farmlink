"use client";

export default function IllustratedFarmBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 w-full h-full"
      >
        {/* Sky gradient */}
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F4F8EC" />
            <stop offset="60%" stopColor="#E8F5D8" />
            <stop offset="100%" stopColor="#C9E4A8" />
          </linearGradient>
          <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B7D98C" />
            <stop offset="100%" stopColor="#9FCB6E" />
          </linearGradient>
          <linearGradient id="hillMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8FC35C" />
            <stop offset="100%" stopColor="#6FA83E" />
          </linearGradient>
          <linearGradient id="fieldNear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C8DE6E" />
            <stop offset="100%" stopColor="#A9C94A" />
          </linearGradient>
        </defs>

        <rect width="1440" height="900" fill="url(#sky)" />

        {/* Soft painterly clouds */}
        <g opacity="0.9">
          <ellipse cx="220" cy="140" rx="90" ry="34" fill="#ffffff" />
          <ellipse cx="290" cy="120" rx="70" ry="30" fill="#ffffff" />
          <ellipse cx="1150" cy="100" rx="100" ry="36" fill="#ffffff" opacity="0.85" />
          <ellipse cx="1230" cy="130" rx="60" ry="24" fill="#ffffff" opacity="0.85" />
          <ellipse cx="700" cy="80" rx="80" ry="28" fill="#ffffff" opacity="0.7" />
        </g>

        {/* Far rolling hill */}
        <path
          d="M0,480 C240,420 480,460 720,430 C960,400 1200,440 1440,410 L1440,900 L0,900 Z"
          fill="url(#hillFar)"
        />

        {/* Winding path on far hill */}
        <path
          d="M900,440 C960,470 1000,520 980,580 C960,640 1030,680 1100,700"
          stroke="#EDE7C9"
          strokeWidth="14"
          fill="none"
          opacity="0.6"
          strokeLinecap="round"
        />

        {/* A few small trees on the mid hill */}
        <g fill="#4A7A2E">
          <circle cx="1180" cy="560" r="22" />
          <circle cx="1210" cy="575" r="16" />
          <circle cx="260" cy="580" r="18" />
        </g>

        {/* Mid rolling hill */}
        <path
          d="M0,620 C260,560 500,600 760,570 C1020,540 1240,580 1440,550 L1440,900 L0,900 Z"
          fill="url(#hillMid)"
        />

        {/* Near wheat field base */}
        <path
          d="M0,700 C300,670 700,700 1440,660 L1440,900 L0,900 Z"
          fill="url(#fieldNear)"
        />

        {/* Foreground wheat stalks */}
        <g stroke="#5A8F2E" strokeWidth="3" strokeLinecap="round">
          {Array.from({ length: 42 }).map((_, i) => {
            const x = (i * 1440) / 42 + (i % 2 === 0 ? 8 : -6);
            const height = 60 + (i % 5) * 10;
            const topY = 900 - height;
            return (
              <g key={i}>
                <line x1={x} y1={900} x2={x} y2={topY} />
                <ellipse cx={x} cy={topY - 6} rx="7" ry="14" fill="#D8C878" stroke="#B8A85A" strokeWidth="1.5" />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
