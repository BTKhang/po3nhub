"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Plus, Check, Heart, Sparkles, Star, Volume2, VolumeX } from "lucide-react";

export interface MovieCardData {
  id?: string;
  _id?: string;
  title: string;
  originalTitle?: string;
  posterUrl: string;
  thumbUrl?: string;
  slug: string;
  year?: string | number;
  quality?: string;
  episodeCurrent?: string;
  language?: string;
  isSeries?: boolean;
  view?: number;
  rating?: number | string;
  hideInfo?: boolean;
  isOriginal?: boolean;
  trailerUrl?: string;
}

const PREVIEW_DEMO_CLIPS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
];

export const NetflixMovieCard3D: React.FC<MovieCardData> = ({
  title,
  originalTitle,
  posterUrl,
  slug,
  quality = "4K UHD",
  language = "Vietsub",
  year,
  rating = 9.8,
  episodeCurrent,
  hideInfo = false,
  isOriginal = true,
  trailerUrl,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isAddedToList, setIsAddedToList] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const demoClip = useMemo(() => {
    if (trailerUrl && trailerUrl.endsWith(".mp4")) return trailerUrl;
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
      hash = (hash << 5) - hash + slug.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % PREVIEW_DEMO_CLIPS.length;
    return PREVIEW_DEMO_CLIPS[idx];
  }, [slug, trailerUrl]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Start preview video after a brief hover delay
    hoverTimerRef.current = setTimeout(() => {
      setIsPlayingDemo(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        void videoRef.current.play().catch(() => {});
      }
    }, 280);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsPlayingDemo(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative w-full select-none z-10 hover:z-30 transition-all duration-300"
    >
      <div className="relative w-full rounded-xl overflow-hidden bg-[#14151d] border border-white/5 shadow-lg group-hover:shadow-[0_15px_35px_rgba(229,9,20,0.3)] transition-all duration-300 group-hover:-translate-y-1">
        <Link href={`/phim/${slug}`} className="block relative aspect-[2/3] w-full overflow-hidden bg-[#161720]">
          {/* Main Poster Image */}
          <Image
            src={posterUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className={`object-cover object-center transition-all duration-500 ${
              isPlayingDemo ? "opacity-0 scale-105" : "opacity-100 group-hover:scale-105"
            }`}
            quality={80}
            loading="lazy"
          />

          {/* Autoplaying Demo Video on Hover */}
          {isPlayingDemo && (
            <div className="absolute inset-0 z-10 bg-black animate-fade-in">
              <video
                ref={videoRef}
                src={demoClip}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Demo Indicator when playing */}
          {isPlayingDemo ? (
            <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-600/90 text-[10px] font-bold text-white shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>Demo</span>
            </div>
          ) : (
            isOriginal && (
              <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#E50914] text-[9px] font-extrabold tracking-wider text-white shadow-md uppercase">
                <Sparkles size={9} className="fill-white" />
                <span>Po3n</span>
              </div>
            )
          )}

          {/* Rating Badge */}
          {rating && (
            <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-amber-400 text-[10px] font-bold">
              <Star size={10} className="fill-amber-400" />
              <span>{rating}</span>
            </div>
          )}

          {/* Bottom Gradient Fade */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-15" />

          {/* Action Overlay */}
          <div className="absolute inset-x-0 bottom-0 z-20 p-3 flex flex-col justify-end">
            <div className="flex items-center justify-between gap-1.5 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-7 h-7 rounded-full bg-[#E50914] hover:bg-[#ff1f2d] text-white flex items-center justify-center shadow-md transition-transform hover:scale-110"
                  title="Xem phim"
                >
                  <Play size={12} className="fill-white translate-x-0.5" />
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsAddedToList(!isAddedToList);
                  }}
                  className={`w-7 h-7 rounded-full border border-white/30 backdrop-blur-md flex items-center justify-center transition-all ${
                    isAddedToList ? "bg-white text-black" : "bg-black/60 text-white hover:border-white hover:scale-110"
                  }`}
                  title={isAddedToList ? "Đã lưu" : "Thêm vào danh sách"}
                >
                  {isAddedToList ? <Check size={11} /> : <Plus size={11} />}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsLiked(!isLiked);
                  }}
                  className={`w-7 h-7 rounded-full border border-white/30 backdrop-blur-md flex items-center justify-center transition-all ${
                    isLiked ? "bg-red-600 border-red-600 text-white" : "bg-black/60 text-white hover:border-white hover:scale-110"
                  }`}
                  title="Yêu thích"
                >
                  <Heart size={11} className={isLiked ? "fill-white" : ""} />
                </button>
              </div>

              {/* Sound Toggle for Demo Video */}
              {isPlayingDemo && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="w-7 h-7 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-black/90 hover:scale-110 transition-all"
                  title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                >
                  {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                </button>
              )}
            </div>

            {/* Quality & Episode Badges */}
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-300">
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white">
                {quality.includes("4K") ? "4K" : quality}
              </span>
              {episodeCurrent && (
                <span className="px-1.5 py-0.5 rounded bg-red-600/80 text-white">
                  {episodeCurrent}
                </span>
              )}
            </div>

            {/* Title */}
            {!hideInfo && (
              <div className="mt-1">
                <h3 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#FF4D4D] transition-colors">
                  {title}
                </h3>
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  {year && <span>{year}</span>}
                  <span>•</span>
                  <span>{language}</span>
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};
