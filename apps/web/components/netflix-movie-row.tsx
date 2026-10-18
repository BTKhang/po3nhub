"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { NetflixMovieCard3D, type MovieCardData } from "./netflix-movie-card-3d";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";

interface NetflixMovieRowProps {
  title: string;
  icon?: string;
  viewMoreLink?: string;
  items: MovieCardData[];
  badgeText?: string;
}

export const NetflixMovieRow: React.FC<NetflixMovieRowProps> = ({
  title,
  icon,
  viewMoreLink,
  items,
  badgeText,
}) => {
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  if (!items || items.length === 0) return null;

  return (
    <section className="py-4 md:py-6 w-full relative group/row select-none">
      <div className="container mx-auto px-4 sm:px-8 md:px-12">
        {/* Row Header - Netflix Typography */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2.5">
            {/* Red Accent Bar */}
            <span className="w-1.5 h-5 md:h-6 bg-[#E50914] rounded-full shadow-[0_0_12px_rgba(229,9,20,0.8)]" />
            
            {icon && <span className="text-lg md:text-xl">{icon}</span>}

            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight uppercase group-hover/row:text-[#FF4D4D] transition-colors">
              {viewMoreLink ? (
                <Link href={viewMoreLink} className="flex items-center gap-1.5 group/title">
                  <span>{title}</span>
                  <span className="text-xs text-white/50 group-hover/title:text-white group-hover/title:translate-x-1 transition-all font-semibold uppercase tracking-widest hidden sm:inline-flex items-center">
                    Xem tất cả <ChevronRight size={14} className="ml-0.5 text-[#E50914]" />
                  </span>
                </Link>
              ) : (
                title
              )}
            </h2>

            {badgeText && (
              <span className="ml-2 px-2 py-0.5 rounded bg-red-600/20 text-[#FF4D4D] border border-red-500/30 text-[10px] font-black uppercase tracking-wider hidden md:inline-block">
                {badgeText}
              </span>
            )}
          </div>

          {viewMoreLink && (
            <Link
              href={viewMoreLink}
              className="sm:hidden text-xs text-gray-400 hover:text-white font-bold flex items-center gap-0.5"
            >
              Tất cả <ChevronRight size={14} />
            </Link>
          )}
        </div>

        {/* Carousel Slider with 3D Depth */}
        <div className="relative">
          {/* Edge Left Navigation Button */}
          <button
            ref={prevRef}
            aria-label="Lướt sang trái"
            className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-40 h-14 sm:h-16 w-10 sm:w-11 bg-black/80 hover:bg-red-600 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 rounded-xl border border-white/10 hover:scale-110 disabled:opacity-0 cursor-pointer shadow-2xl"
          >
            <ChevronLeft size={28} />
          </button>

          {/* Edge Right Navigation Button */}
          <button
            ref={nextRef}
            aria-label="Lướt sang phải"
            className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-40 h-14 sm:h-16 w-10 sm:w-11 bg-black/80 hover:bg-red-600 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 rounded-xl border border-white/10 hover:scale-110 disabled:opacity-0 cursor-pointer shadow-2xl"
          >
            <ChevronRight size={28} />
          </button>

          {/* Swiper List */}
          <Swiper
            modules={[Navigation]}
            spaceBetween={14}
            slidesPerView={2.2}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onBeforeInit={(swiper: SwiperType) => {
              const navigation = swiper.params.navigation;
              if (navigation && typeof navigation !== "boolean") {
                navigation.prevEl = prevRef.current;
                navigation.nextEl = nextRef.current;
              }
            }}
            breakpoints={{
              480: { slidesPerView: 2.5, spaceBetween: 14 },
              640: { slidesPerView: 3.4, spaceBetween: 16 },
              768: { slidesPerView: 4.2, spaceBetween: 18 },
              1024: { slidesPerView: 5.2, spaceBetween: 20 },
              1280: { slidesPerView: 6.2, spaceBetween: 20 },
            }}
            className="!overflow-visible !py-4"
          >
            {items.map((movie) => (
              <SwiperSlide key={movie.id || movie._id || movie.slug} className="!h-auto">
                <NetflixMovieCard3D {...movie} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

