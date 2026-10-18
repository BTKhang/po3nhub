"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Info, Volume2, VolumeX, Pause, RotateCcw } from "lucide-react";
import type { ListMovie } from "@/lib/ophim-client";

interface NetflixHeroBillboardProps {
  movies: ListMovie[];
}

const HERO_CINEMATIC_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
];

export const NetflixHeroBillboard: React.FC<NetflixHeroBillboardProps> = ({ movies }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeMovie = movies[currentIndex] || movies[0];

  const heroVideoUrl = useMemo(() => {
    if (!activeMovie) return HERO_CINEMATIC_VIDEOS[0];
    let hash = 0;
    const key = activeMovie.slug || activeMovie._id || "hero";
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % HERO_CINEMATIC_VIDEOS.length;
    return HERO_CINEMATIC_VIDEOS[idx];
  }, [activeMovie]);

  // Handle movie transition & auto background video start
  useEffect(() => {
    setIsVideoReady(false);
    setIsPlayingVideo(false);

    if (videoTimerRef.current) {
      clearTimeout(videoTimerRef.current);
    }

    // Delay 1.2s before autoplaying background video like real Netflix
    videoTimerRef.current = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current
          .play()
          .then(() => {
            setIsVideoReady(true);
            setIsPlayingVideo(true);
          })
          .catch(() => {
            setIsVideoReady(false);
            setIsPlayingVideo(false);
          });
      }
    }, 1200);

    return () => {
      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current);
      }
    };
  }, [currentIndex, activeMovie]);

  // Auto-switch hero movie after 25s if user is idle
  useEffect(() => {
    if (!movies || movies.length <= 1) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % Math.min(movies.length, 6));
        setIsTransitioning(false);
      }, 400);
    }, 28000);

    return () => clearInterval(interval);
  }, [movies]);

  if (!activeMovie) return null;

  const handleSelectMovie = (idx: number) => {
    if (idx === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(idx);
      setIsTransitioning(false);
    }, 300);
  };

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    if (isPlayingVideo) {
      videoRef.current.pause();
      setIsPlayingVideo(false);
    } else {
      videoRef.current.play().then(() => setIsPlayingVideo(true)).catch(() => {});
    }
  };

  const restartVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().then(() => setIsPlayingVideo(true)).catch(() => {});
  };

  return (
    <section className="relative w-full h-[85vh] min-h-[640px] max-h-[960px] overflow-hidden select-none bg-[#090a0f]">
      {/* Background Media Container */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-out ${
          isTransitioning ? "opacity-30 filter blur-sm" : "opacity-100 filter blur-0"
        }`}
      >
        {/* High-res Static Poster Backdrop */}
        <Image
          src={activeMovie.thumb_url || activeMovie.poster_url}
          alt={activeMovie.name}
          fill
          priority
          sizes="100vw"
          className={`object-cover object-[center_20%] transition-opacity duration-1000 ${
            isVideoReady ? "opacity-0" : "opacity-100"
          }`}
          quality={85}
        />

        {/* Real Netflix Auto-playing Background Video */}
        <video
          ref={videoRef}
          src={heroVideoUrl}
          loop
          muted={isMuted}
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isVideoReady ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Multi-layer Cinematic Shadows & Gradients for High Readability */}
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/80 to-transparent z-10" />
        <div className="absolute inset-y-0 left-0 w-full md:w-3/5 bg-gradient-to-r from-[#090a0f] via-[#090a0f]/85 to-transparent z-10" />
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/90 via-black/40 to-transparent z-10" />
      </div>

      {/* Hero Content Information */}
      <div className="container relative z-20 mx-auto h-full px-4 sm:px-8 md:px-12 flex flex-col justify-center pt-24 pb-16">
        <div className="max-w-2xl space-y-4 md:space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-red-600/30 shadow-[0_0_15px_rgba(229,9,20,0.3)]">
            <span className="flex h-2 w-2 rounded-full bg-[#E50914] shadow-[0_0_8px_#E50914]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF4D4D]">
              Đề Xuất Nổi Bật
            </span>
            <span className="text-white/40">•</span>
            <span className="text-xs font-semibold text-gray-300">
              Xu Hướng
            </span>
            {isVideoReady && (
              <>
                <span className="text-white/40">•</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Trailer nền
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] drop-shadow-2xl uppercase">
              {activeMovie.name}
            </h1>
            {activeMovie.origin_name && (
              <p className="text-base sm:text-xl font-medium text-gray-300 italic drop-shadow-md">
                {activeMovie.origin_name} {activeMovie.year ? `(${activeMovie.year})` : ""}
              </p>
            )}
          </div>

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              99% Phù hợp
            </span>
            <span className="px-2.5 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-600/40 uppercase">
              18+
            </span>
            <span className="px-2.5 py-0.5 rounded bg-white/10 text-white border border-white/20">
              4K Ultra HD
            </span>
            <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {activeMovie.lang || "Vietsub Full"}
            </span>
          </div>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-gray-300/90 line-clamp-3 leading-relaxed drop-shadow-md max-w-xl">
            {activeMovie.content
              ? activeMovie.content.replace(/<[^>]*>?/gm, "")
              : "Khám phá bộ phim điện ảnh đặc sắc đang được hàng triệu khán giả quan tâm với đồ họa sống động chuẩn rạp."}
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={`/xem-phim/${activeMovie.slug}`}
              className="inline-flex items-center gap-3 px-7 sm:px-8 py-3.5 rounded-xl bg-white hover:bg-[#E50914] text-black hover:text-white font-extrabold text-base shadow-[0_4px_25px_rgba(255,255,255,0.3)] hover:shadow-[0_4px_25px_rgba(229,9,20,0.5)] transition-all duration-300 transform hover:scale-105 active:scale-95 group"
            >
              <Play size={20} className="fill-current transform group-hover:scale-110 transition-transform" />
              <span>Phát ngay</span>
            </Link>

            <Link
              href={`/phim/${activeMovie.slug}`}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-base border border-white/15 shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <Info size={20} />
              <span>Chi tiết phim</span>
            </Link>
          </div>
        </div>

        {/* Right Bottom Floating Controls (Netflix Style) */}
        <div className="absolute right-4 sm:right-8 md:right-12 bottom-12 flex flex-col items-end gap-3 z-30">
          <div className="flex items-center gap-2.5">
            {/* Play/Pause Background Video */}
            {isVideoReady && (
              <button
                onClick={toggleVideoPlayback}
                aria-label={isPlayingVideo ? "Tạm dừng trailer" : "Tiếp tục phát trailer"}
                className="w-10 h-10 rounded-full border border-white/20 bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:border-white hover:scale-110 transition-all shadow-lg"
                title={isPlayingVideo ? "Tạm dừng trailer nền" : "Phát trailer nền"}
              >
                {isPlayingVideo ? <Pause size={16} /> : <Play size={16} className="fill-white translate-x-0.5" />}
              </button>
            )}

            {/* Mute/Unmute Background Video */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              aria-label={isMuted ? "Bật âm thanh trailer" : "Tắt âm thanh trailer"}
              className={`w-10 h-10 rounded-full border backdrop-blur-md flex items-center justify-center hover:scale-110 transition-all shadow-lg ${
                !isMuted
                  ? "bg-red-600 border-red-500 text-white shadow-red-900/50"
                  : "bg-black/60 border-white/20 text-white hover:border-white"
              }`}
              title={isMuted ? "Bật âm thanh trailer" : "Tắt âm thanh trailer"}
            >
              {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>

            {/* Age Rating Tag */}
            <div className="px-3 py-1.5 border-l-4 border-red-600 bg-black/60 backdrop-blur-md text-xs font-black uppercase text-white shadow-lg tracking-wider">
              18+ | 4K UHD
            </div>
          </div>

          {/* Quick Movie Thumbnail Switcher */}
          <div className="hidden lg:flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl">
            {movies.slice(0, 5).map((m, idx) => (
              <button
                key={m._id || m.slug}
                onClick={() => handleSelectMovie(idx)}
                className={`relative w-12 h-16 rounded-lg overflow-hidden transition-all duration-300 transform ${
                  idx === currentIndex
                    ? "ring-2 ring-[#E50914] scale-110 shadow-[0_0_15px_rgba(229,9,20,0.7)]"
                    : "opacity-50 hover:opacity-100 hover:scale-105"
                }`}
                title={m.name}
              >
                <Image
                  src={m.poster_url}
                  alt={m.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
