"use client";

import React from "react";
import Link from "next/link";

interface Po3nHubLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showOriginalTag?: boolean;
}

export const Po3nHubLogo: React.FC<Po3nHubLogoProps> = ({
  className = "",
  size = "md",
  showOriginalTag = false,
}) => {
  const sizeConfig = {
    sm: { height: "h-6 sm:h-7", text: "text-lg", hub: "text-xs px-1.5 py-0.5", tag: "text-[8px]" },
    md: { height: "h-7 sm:h-8 md:h-9", text: "text-xl sm:text-2xl", hub: "text-sm sm:text-base px-2 py-0.5", tag: "text-[9px]" },
    lg: { height: "h-10 sm:h-12", text: "text-3xl sm:text-4xl", hub: "text-lg sm:text-xl px-2.5 py-1", tag: "text-[10px]" },
    xl: { height: "h-14 sm:h-16", text: "text-5xl", hub: "text-2xl px-3 py-1.5", tag: "text-xs" },
  }[size];

  return (
    <Link
      href="/"
      aria-label="Po3nHub Trang Chủ"
      className={`group relative inline-flex items-center gap-1.5 select-none transition-transform duration-300 hover:scale-105 ${className}`}
    >
      {/* 3D Cinematic Ribbon Icon */}
      <div className="relative flex items-center justify-center">
        <span className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center">
          <span className="absolute inset-0 rounded-lg bg-gradient-to-tr from-[#990000] via-[#E50914] to-[#FF4D4D] shadow-[0_0_15px_rgba(229,9,20,0.6)] group-hover:shadow-[0_0_25px_rgba(229,9,20,0.9)] transition-all duration-300 transform -rotate-6 group-hover:rotate-0" />
          <span className="absolute inset-0.5 rounded-[6px] bg-gradient-to-b from-white/20 to-transparent" />
          <svg
            className="relative z-10 w-4 h-4 text-white drop-shadow-md fill-current transform translate-x-0.5"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>

      {/* Brand Typography */}
      <div className="flex items-center tracking-tight">
        <span
          className={`font-black uppercase tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.25)] ${sizeConfig.text}`}
          style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
        >
          Po<span className="text-[#E50914] drop-shadow-[0_0_12px_rgba(229,9,20,0.8)]">3</span>n
        </span>

        {/* Netflix-style Bold Red Badge for HUB */}
        <span
          className={`ml-1 font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#E50914] to-[#B81D24] rounded-md shadow-[0_2px_12px_rgba(229,9,20,0.5)] border border-red-400/30 group-hover:from-[#FF1E27] group-hover:to-[#E50914] group-hover:shadow-[0_0_20px_rgba(229,9,20,0.8)] transition-all duration-300 ${sizeConfig.hub}`}
        >
          HUB
        </span>
      </div>

      {showOriginalTag && (
        <span
          className={`ml-1 px-1.5 py-0.2 border border-red-500/40 rounded bg-red-950/60 text-[#ff4d4d] font-bold tracking-widest uppercase ${sizeConfig.tag}`}
        >
          ORIGINAL
        </span>
      )}
    </Link>
  );
};

