"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Artplayer from "artplayer";
import Hls from "hls.js";
import { Volume2, VolumeX, SkipForward, Play, ShieldAlert } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  poster?: string;
  title?: string;
  onReady?: (art: Artplayer) => void;
  onEnded?: () => void;
  enableAds?: boolean;
  adsReady?: boolean;
}

interface AdVideoResponse {
  introVideos?: Array<string | { url: string }>;
  adVideos?: Array<string | { url: string }>;
  preroll?: string;
  ads?: string[];
}

function chooseRandomVideo(videos: string[], fallback: string): string {
  return videos[Math.floor(Math.random() * videos.length)] || fallback;
}

export const VideoPlayer = ({
  url,
  poster,
  title,
  onReady,
  onEnded,
  enableAds = true,
  adsReady = true,
}: VideoPlayerProps) => {
  const artRef = useRef<HTMLDivElement>(null);
  const adVideoRef = useRef<HTMLVideoElement>(null);
  const artInstanceRef = useRef<Artplayer | null>(null);
  const onEndedRef = useRef(onEnded);

  // Ad states
  const [introList, setIntroList] = useState<string[]>([
    "/intro/intro-quancao.mp4",
  ]);
  const [adList, setAdList] = useState<string[]>([]);
  const [adConfigLoaded, setAdConfigLoaded] = useState(false);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [adType, setAdType] = useState<"preroll" | "midroll">("preroll");
  const [currentAdUrl, setCurrentAdUrl] = useState("/intro/intro-quancao.mp4");
  const [adCountdown, setAdCountdown] = useState(5);
  const [canSkipAd, setCanSkipAd] = useState(false);
  const [isAdMuted, setIsAdMuted] = useState(false);
  const [adDuration, setAdDuration] = useState(0);
  const [adCurrentTime, setAdCurrentTime] = useState(0);
  const savedPlaybackTimeRef = useRef<number>(0);
  const nextMidrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  const isEmbed =
    typeof url === "string" &&
    (url.includes("/player/?url=") ||
      url.includes("/embed/") ||
      url.includes("youtube.com") ||
      url.includes("embed"));

  // Fetch available ads from /api/ads
  useEffect(() => {
    if (!enableAds) return;

    let isMounted = true;
    fetch("/api/ads")
      .then((res) => res.json())
      .then((data: AdVideoResponse) => {
        if (!isMounted) return;
        const introVideos = Array.isArray(data.introVideos)
          ? data.introVideos.map((video) =>
              typeof video === "string" ? video : video.url,
            )
          : data.preroll
            ? [data.preroll]
            : [];
        const adVideos = Array.isArray(data.adVideos)
          ? data.adVideos.map((video) =>
              typeof video === "string" ? video : video.url,
            )
          : data.ads || [];
        if (introVideos.length > 0) setIntroList(introVideos);
        setAdList(adVideos);
      })
      .catch(() => {
        // use default fallback
      })
      .finally(() => {
        if (isMounted) setAdConfigLoaded(true);
      });
    return () => {
      isMounted = false;
    };
  }, [enableAds]);

  // Trigger ad
  const playAd = useCallback(
    (type: "preroll" | "midroll", adSrc: string) => {
      if (!enableAds) return;

      // If movie is playing, pause and record timestamp
      if (artInstanceRef.current) {
        try {
          savedPlaybackTimeRef.current =
            artInstanceRef.current.currentTime || 0;
          artInstanceRef.current.pause();
        } catch {
          // ignore
        }
      }

      setAdType(type);
      setCurrentAdUrl(adSrc);
      setAdCountdown(5);
      setCanSkipAd(false);
      setIsAdPlaying(true);
    },
    [enableAds],
  );

  // Finish or skip ad
  const handleDismissAd = useCallback(() => {
    setIsAdPlaying(false);

    // Resume main movie player
    if (artInstanceRef.current) {
      try {
        if (savedPlaybackTimeRef.current > 0) {
          artInstanceRef.current.currentTime = savedPlaybackTimeRef.current;
        }
        artInstanceRef.current.play();
      } catch {
        // ignore
      }
    }

    // Schedule next random mid-roll ad (random between 5 to 10 minutes)
    if (enableAds) {
      if (nextMidrollTimeoutRef.current) {
        clearTimeout(nextMidrollTimeoutRef.current);
      }
      const randomDelay =
        (Math.floor(Math.random() * (600 - 300 + 1)) + 300) * 1000;
      nextMidrollTimeoutRef.current = setTimeout(() => {
        if (adList.length === 0) return;
        playAd("midroll", chooseRandomVideo(adList, ""));
      }, randomDelay);
    }
  }, [adList, enableAds, playAd]);

  // Handle countdown during ad playback
  useEffect(() => {
    if (!isAdPlaying) return;

    const timer = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          setCanSkipAd(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAdPlaying]);

  // When episode changes: trigger pre-roll intro-quancao ad
  useEffect(() => {
    if (!url || !adsReady || !adConfigLoaded) return;

    if (enableAds) {
      playAd(
        "preroll",
        chooseRandomVideo(introList, "/intro/intro-quancao.mp4"),
      );
    } else {
      setIsAdPlaying(false);
    }

    return () => {
      if (nextMidrollTimeoutRef.current) {
        clearTimeout(nextMidrollTimeoutRef.current);
      }
    };
  }, [url, enableAds, adsReady, adConfigLoaded, introList, playAd]);

  // Initialize main video player (Artplayer)
  useEffect(() => {
    if (!artRef.current || isEmbed || !adsReady) return;

    let hlsInstance: Hls | null = null;
    let art: Artplayer | null = null;

    try {
      art = new Artplayer({
        container: artRef.current,
        url: url,
        poster: poster,
        volume: 0.75,
        isLive: false,
        muted: false,
        autoplay: !enableAds, // if ads enabled, ad plays first
        pip: true,
        autoSize: true,
        autoMini: true,
        screenshot: true,
        setting: true,
        loop: false,
        flip: true,
        playbackRate: true,
        aspectRatio: true,
        fullscreen: true,
        fullscreenWeb: true,
        subtitleOffset: true,
        miniProgressBar: true,
        mutex: true,
        backdrop: true,
        playsInline: true,
        autoPlayback: true,
        airplay: true,
        theme: "#E50914",
        moreVideoAttr: {
          crossOrigin: "anonymous",
        },
        customType: {
          m3u8: function (video: HTMLMediaElement, sourceUrl: string) {
            if (Hls.isSupported()) {
              if (hlsInstance) {
                hlsInstance.destroy();
              }
              const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
              });
              hls.loadSource(sourceUrl);
              hls.attachMedia(video);
              hlsInstance = hls;
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
              video.src = sourceUrl;
            } else if (art) {
              art.notice.show = "Định dạng video không được hỗ trợ";
            }
          },
        },
      });

      artInstanceRef.current = art;
      art.on("video:ended", () => onEndedRef.current?.());

      if (onReady && art) {
        onReady(art);
      }
    } catch (err) {
      console.error("Failed to initialize Artplayer:", err);
    }

    return () => {
      if (hlsInstance) {
        try {
          hlsInstance.destroy();
        } catch {
          // ignore
        }
        hlsInstance = null;
      }

      if (art) {
        try {
          if (art.mini) art.mini = false;
          if (art.pip) art.pip = false;
        } catch {
          // ignore
        }

        try {
          if (typeof art.destroy === "function") {
            art.destroy(true);
          }
        } catch {
          // ignore
        }
        art = null;
        artInstanceRef.current = null;
      }

      if (typeof document !== "undefined") {
        const lingeringMinis = document.querySelectorAll(
          ".art-auto-mini, .art-mini, .artplayer-app.art-auto-mini, .artplayer-mini",
        );
        lingeringMinis.forEach((el) => {
          el.remove();
        });
      }
    };
  }, [url, poster, isEmbed, onReady, enableAds, adsReady]);

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl transition-all duration-300 border border-white/5 ring-1 ring-white/10 group">
      {/* Main Video Viewport */}
      {isEmbed ? (
        adsReady ? (
          <iframe
            src={url}
            title={title || "Po3nHub Player"}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full" />
        )
      ) : (
        <div ref={artRef} className="w-full h-full" />
      )}

      {/* Cinema AD OVERLAY (Pre-roll and Mid-roll) */}
      {isAdPlaying && (
        <div className="absolute inset-0 z-30 bg-black flex flex-col justify-between select-none animate-in fade-in duration-200">
          {/* Ad Video Stream */}
          <video
            ref={adVideoRef}
            src={currentAdUrl}
            autoPlay
            playsInline
            muted={isAdMuted}
            onTimeUpdate={(e) => {
              const video = e.currentTarget;
              setAdCurrentTime(video.currentTime);
              setAdDuration(video.duration || 0);
            }}
            onEnded={handleDismissAd}
            className="w-full h-full object-contain bg-black cursor-pointer"
            onClick={() => {
              if (adVideoRef.current) {
                if (adVideoRef.current.paused) {
                  adVideoRef.current.play();
                } else {
                  adVideoRef.current.pause();
                }
              }
            }}
          />

          {/* Top Bar info */}
          <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E50914] text-white text-[11px] font-black uppercase tracking-wider shadow-lg">
                <ShieldAlert size={12} />
                Quảng Cáo
              </span>
              <span className="text-xs text-white/90 font-semibold drop-shadow hidden sm:inline">
                {adType === "preroll"
                  ? "Phim sẽ bắt đầu ngay sau phần giới thiệu"
                  : "Chương trình tài trợ Po3nHub"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsAdMuted(!isAdMuted)}
              className="pointer-events-auto w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all backdrop-blur-md"
              title={isAdMuted ? "Bật âm thanh quảng cáo" : "Tắt tiếng"}
            >
              {isAdMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>

          {/* Bottom Bar: Skip Button & Timeline */}
          <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end justify-between gap-4 pointer-events-none">
            <div className="text-white drop-shadow">
              <p className="text-xs sm:text-sm font-bold text-white/90">
                {title || "Po3nHub Cinema"}
              </p>
              <p className="text-[11px] text-white/60">
                Đang phát video quảng cáo ({Math.round(adCurrentTime)}s /{" "}
                {Math.round(adDuration) || 15}s)
              </p>
            </div>

            {/* Skip Ad Action */}
            <div className="pointer-events-auto shrink-0">
              {canSkipAd ? (
                <button
                  type="button"
                  onClick={handleDismissAd}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#ff1f2d] text-white text-xs sm:text-sm font-black transition-all shadow-[0_0_20px_rgba(229,9,20,0.6)] transform hover:scale-105 active:scale-95 border border-red-500/50 cursor-pointer"
                >
                  <span>Bỏ qua quảng cáo</span>
                  <SkipForward size={16} />
                </button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/80 border border-white/20 text-white/90 text-xs sm:text-sm font-bold backdrop-blur-md">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Bỏ qua sau {adCountdown}s</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Progress Bar */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
            <div
              className="h-full bg-[#E50914] transition-all duration-200"
              style={{
                width: `${adDuration > 0 ? (adCurrentTime / adDuration) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default VideoPlayer;
