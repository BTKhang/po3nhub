"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Film, Tv, Flame, Clapperboard, Heart, Ghost, Sword } from "lucide-react";

const CATEGORIES = [
  { name: "Phim Bộ Hot", slug: "phim-bo", href: "/danh-sach/phim-bo", icon: Tv, gradient: "from-red-600 to-rose-950" },
  { name: "Phim Chiếu Rạp", slug: "phim-le", href: "/danh-sach/phim-le", icon: Film, gradient: "from-amber-600 to-stone-900" },
  { name: "Hành Động", slug: "hanh-dong", href: "/the-loai/hanh-dong", icon: Flame, gradient: "from-orange-600 to-amber-950" },
  { name: "Anime & Hoạt Hình", slug: "hoat-hinh", href: "/danh-sach/hoat-hinh", icon: Sparkles, gradient: "from-purple-600 to-violet-950" },
  { name: "Kinh Dị", slug: "kinh-di", href: "/the-loai/kinh-di", icon: Ghost, gradient: "from-emerald-700 to-teal-950" },
  { name: "Cổ Trang", slug: "co-trang", href: "/the-loai/co-trang", icon: Sword, gradient: "from-yellow-600 to-amber-950" },
  { name: "Tình Cảm", slug: "tinh-cam", href: "/the-loai/tinh-cam", icon: Heart, gradient: "from-pink-600 to-rose-950" },
];

export const NetflixCategoriesBanner: React.FC = () => {
  return (
    <section className="py-6 w-full select-none">
      <div className="container mx-auto px-4 sm:px-8 md:px-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-4 bg-[#E50914] rounded-full" />
          <h3 className="text-sm md:text-base font-extrabold text-white uppercase tracking-wider">
            Khám phá theo danh mục
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={cat.href}
                className="group relative flex flex-col justify-between p-3.5 rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/[0.08] hover:border-[#E50914]/50 backdrop-blur-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(229,9,20,0.3)]"
              >
                {/* Ambient dynamic gradient on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
                />

                <div className="relative z-10 flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-white group-hover:text-[#FF4D4D] group-hover:scale-110 transition-all">
                    <Icon size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest group-hover:text-white transition-colors">
                    Xem &gt;
                  </span>
                </div>

                <div className="relative z-10">
                  <span className="block font-black text-sm text-white group-hover:text-[#FF4D4D] transition-colors line-clamp-1">
                    {cat.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

