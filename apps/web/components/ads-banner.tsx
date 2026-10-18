"use client";

import Link from "next/link";
import { PlayCircle, Sparkles } from "lucide-react";

export const AdsBanner = () => {
  return (
    <div className="container mx-auto px-4 md:px-10 py-7 md:py-10">
      <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[#12131a] shadow-[0_18px_60px_rgba(0,0,0,0.5)]">
        <div className="relative flex min-h-[96px] flex-col items-center justify-center gap-4 px-5 py-6 text-center md:min-h-[112px] md:flex-row md:justify-between md:px-9 md:text-left">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-red-900/10 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E50914] text-white shadow-[0_0_20px_rgba(229,9,20,0.5)]">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="text-base md:text-xl font-bold text-white">
                Po3nHub cập nhật phim mới mỗi ngày
              </h4>
              <p className="mt-1 text-xs text-gray-400">
                Kho phim điện ảnh 4K Ultra HD, thuyết minh và vietsub đầy đủ với tốc độ cao.
              </p>
            </div>
          </div>
          <Link
            href="/danh-sach/phim-moi"
            className="relative inline-flex items-center gap-2 rounded-xl bg-[#E50914] hover:bg-[#ff1f2d] px-5 py-2.5 text-xs font-bold text-white transition-all shadow-lg shadow-red-950/50 hover:scale-105"
          >
            <PlayCircle size={16} />
            Khám phá ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
