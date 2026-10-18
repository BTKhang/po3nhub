"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, Info } from "lucide-react";

export const GhibliSection = () => {
  return (
    <section className="py-16 w-full">
      <div className="container mx-auto px-4 md:px-10">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            Studio Ghibli
          </h2>
          <div className="w-1.5 h-6 bg-[#E50914] rounded-full shadow-[0_0_12px_rgba(229,9,20,0.8)]" />
        </div>

        <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden group shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-white/10">
          <Image
            src="https://phimimg.com/upload/vod/20250716-1/3be680dcb8b627540ea2703730db511f.jpg"
            alt="Studio Ghibli"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16">
            <div className="max-w-xl space-y-4 md:space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-[#E50914] text-white text-[10px] font-black rounded-full uppercase shadow-md">
                  Po3nHub Tuyển Chọn
                </span>
                <span className="text-white/60 text-xs font-bold uppercase tracking-widest italic">
                  Hayao Miyazaki
                </span>
              </div>
              <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none italic drop-shadow-lg">
                Chuyến phiêu lưu
                <br />
                Vùng đất linh hồn
              </h3>
              <p className="text-white/70 text-sm md:text-base line-clamp-2 max-w-lg leading-relaxed">
                Đắm mình trong thế giới kỳ ảo của Studio Ghibli. Những tác phẩm
                nghệ thuật vượt thời gian, đầy cảm xúc và triết lý sâu sắc.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Link
                  href="/phim/vung-dat-linh-hon"
                  className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-lg font-black uppercase text-xs hover:bg-[#E50914] hover:text-white transition-all shadow-lg hover:scale-105"
                >
                  <Play size={14} className="fill-current" />
                  Phát Ngay
                </Link>
                <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-white/10">
                  <Info size={16} />
                  <span>Bộ sưu tập</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
