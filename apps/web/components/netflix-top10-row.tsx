"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Flame } from "lucide-react";
import { NetflixMovieCard3D, type MovieCardData } from "./netflix-movie-card-3d";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";

interface NetflixTop10RowProps {
  title: string;
  items: MovieCardData[];
}

export const NetflixTop10Row: React.FC<NetflixTop10RowProps> = ({ title, items }) => {
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  if (!items || items.length === 0) return null;

  return (
    <section className="py-8 md:py-12 w-full relative group/top10 select-none overflow-hidden">
      <div className="container mx-auto px-4 sm:px-8 md:px-12">
        {/* Row Header */}
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-[#E50914] to-[#FF4D4D] shadow-[0_0_15px_rgba(229,9,20,0.6)]">
            <Flame size={18} className="text-white fill-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-[950] text-white uppercase tracking-tight italic">
              {title}
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              Cập nhật liên tục theo lượt xem thời gian thực trên Po3nHub
            </p>
          </div>
        </div>

        {/* Carousel Slider with 3D Overlapping Numbers */}
        <div className="relative">
          {/* Edge Navigation Buttons */}
          <button
            ref={prevRef}
            aria-label="Lướt sang trái"
            className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-40 h-14 sm:h-16 w-10 sm:w-11 bg-black/80 hover:bg-red-600 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/top10:opacity-100 transition-all duration-300 rounded-xl border border-white/10 hover:scale-110 disabled:opacity-0 cursor-pointer shadow-2xl"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            ref={nextRef}
            aria-label="Lướt sang phải"
            className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-40 h-14 sm:h-16 w-10 sm:w-11 bg-black/80 hover:bg-red-600 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/top10:opacity-100 transition-all duration-300 rounded-xl border border-white/10 hover:scale-110 disabled:opacity-0 cursor-pointer shadow-2xl"
          >
            <ChevronRight size={28} />
          </button>

          <Swiper
            modules={[Navigation]}
            spaceBetween={20}
            slidesPerView={1.8}
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
              480: { slidesPerView: 2.2, spaceBetween: 24 },
              640: { slidesPerView: 2.8, spaceBetween: 28 },
              768: { slidesPerView: 3.4, spaceBetween: 30 },
              1024: { slidesPerView: 4.4, spaceBetween: 32 },
              1280: { slidesPerView: 5.2, spaceBetween: 36 },
            }}
            className="!overflow-visible !py-6"
          >
            {items.slice(0, 10).map((movie, index) => {
              const rank = index + 1;
              return (
                <SwiperSlide key={movie.id || movie._id || movie.slug} className="!h-auto group/item">
                  <div className="relative flex items-center">
                    {/* Giant 3D Netflix-Style Rank Number */}
                    <div
                      className="shrink-0 select-none pointer-events-none transform -translate-x-2 sm:-translate-x-4 transition-transform duration-500 group-hover/item:scale-110 z-0"
                      style={{ width: "38%" }}
                    >
                      <span
                        className="block text-[115px] sm:text-[140px] md:text-[160px] font-black italic leading-none text-transparent"
                        style={{
                          fontFamily: "var(--font-oswald), 'Impact', sans-serif",
                          WebkitTextStroke: rank <= 3 ? "3.5px #E50914" : "3px #444857",
                          filter: rank <= 3 ? "drop-shadow(0 0 18px rgba(229,9,20,0.5))" : "drop-shadow(0 0 10px rgba(0,0,0,0.8))",
                        }}
                      >
                        {rank}
                      </span>
                    </div>

                    {/* Movie Card */}
                    <div className="flex-1 -ml-6 sm:-ml-10 relative z-10">
                      <NetflixMovieCard3D {...movie} isOriginal={rank <= 3} />
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

