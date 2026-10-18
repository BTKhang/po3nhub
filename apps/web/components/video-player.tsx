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
  onNext?: () => void;
  nextEpisodeLabel?: string;
  enableAds?: boolean;
  adsReady?: boolean;
}

export const VideoPlayer = ({
  url,
  poster,
  title,
  onReady,
  onEnded,
  onNext,
  nextEpisodeLabel,
  enableAds = true,
  adsReady = true,
}: VideoPlayerProps) => {
  const artRef = useRef<HTMLDivElement>(null);
  const adVideoRef = useRef<HTMLVideoElement>(null);
  const artInstanceRef = useRef<Artplayer | null>(null);
  const onEndedRef = useRef(onEnded);
  const onNextRef = useRef(onNext);

  // Ad states - initialized with default intro-quancao.mp4
  const [introList, setIntroList] = useState<string[]>([
    "/intro/intro-quancao.mp4",
  ]);
  const [adList, setAdList] = useState<string[]>([
    "/intro/intro-quancao.mp4",
  ]);

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
    onNextRef.current = onNext;
  }, [onEnded, onNext]);

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
      .then((data) => {
        if (!isMounted) return;
        const intros = Array.isArray(data?.introVideos)
          ? data.introVideos
          : ["/intro/intro-quancao.mp4"];
        const ads = Array.isArray(data?.adVideos) && data.adVideos.length > 0
          ? data.adVideos
          : intros;
        if (intros.length > 0) setIntroList(intros);
        if (ads.length > 0) setAdList(ads);
      })
      .catch(() => {
        // keep default fallback
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

    // Schedule next random mid-roll ad (random between 4 to 8 minutes)
    if (enableAds) {
      if (nextMidrollTimeoutRef.current) {
        clearTimeout(nextMidrollTimeoutRef.current);
      }
      const randomDelay =
        (Math.floor(Math.random() * (480 - 240 + 1)) + 240) * 1000;
      nextMidrollTimeoutRef.current = setTimeout(() => {
        const pool = adList.length > 0 ? adList : introList;
        const randomAd = pool[Math.floor(Math.random() * pool.length)] || "/intro/intro-quancao.mp4";
        playAd("midroll", randomAd);
      }, randomDelay);
    }
  }, [adList, introList, enableAds, playAd]);

  // Auto-play the ad video element and handle browser autoplay permissions
  useEffect(() => {
    if (!isAdPlaying || !adVideoRef.current) return;
    const video = adVideoRef.current;
    video.currentTime = 0;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Browser blocked audio autoplay, playing muted:", err);
        video.muted = true;
        setIsAdMuted(true);
        video.play().catch(() => {});
      });
    }
  }, [isAdPlaying, currentAdUrl]);

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

  // When episode loads: trigger pre-roll intro-quancao ad IMMEDIATELY
  useEffect(() => {
    if (!url || !adsReady) return;

    if (enableAds) {
      const selectedIntro =
        introList[Math.floor(Math.random() * introList.length)] ||
        "/intro/intro-quancao.mp4";
      playAd("preroll", selectedIntro);
    } else {
      setIsAdPlaying(false);
    }

    return () => {
      if (nextMidrollTimeoutRef.current) {
        clearTimeout(nextMidrollTimeoutRef.current);
      }
    };
  }, [url, enableAds, adsReady, introList, playAd]);

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
        controls: onNext
          ? [
              {
                name: "next-episode",
                position: "left",
                index: 10,
                html: '<span class="art-icon" style="display:inline-flex;align-items:center;justify-content:center;color:#fff;cursor:pointer;padding:0 6px;" title="Tập tiếp theo"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg></span>',
                tooltip: nextEpisodeLabel || "Tập tiếp theo",
                click: function () {
                  if (onNextRef.current) {
                    onNextRef.current();
                  }
                },
              },
            ]
          : [],
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

      art.on("video:ended", () => {
        if (onEndedRef.current) {
          onEndedRef.current();
        }
      });

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
          ".art-auto-mini, .art-mini, .artplayer-app.art-auto-mini, .artplayer-mini"
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
        <iframe
          src={url}
          title={title || "Po3nHub Player"}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <div ref={artRef} className="w-full h-full" />
      )}

      {/* Floating Next Episode Button (Visible directly on player) */}
      {onNext && !isAdPlaying && (
        <button
          type="button"
          onClick={onNext}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-black/85 hover:bg-[#E50914] text-white text-xs sm:text-sm font-black border border-white/20 hover:border-red-500 shadow-2xl backdrop-blur-md transition-all duration-200 transform hover:scale-105 active:scale-95 group/next cursor-pointer"
          title={nextEpisodeLabel || "Tập tiếp theo"}
        >
          <span>{nextEpisodeLabel || "Tập tiếp theo"}</span>
          <SkipForward size={15} className="text-[#ffd875] group-hover/next:text-white transition-colors" />
        </button>
      )}

      {/* Cinema AD OVERLAY (Pre-roll and Mid-roll) */}
      {isAdPlaying && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col justify-between select-none animate-in fade-in duration-200">
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
              onClick={() => {
                if (adVideoRef.current) {
                  adVideoRef.current.muted = !isAdMuted;
                }
                setIsAdMuted(!isAdMuted);
              }}
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white text-xs font-bold border border-white/20 transition-all backdrop-blur-md cursor-pointer"
              title={isAdMuted ? "Bật âm thanh quảng cáo" : "Tắt tiếng"}
            >
              {isAdMuted ? (
                <>
                  <VolumeX size={15} className="text-amber-400" />
                  <span className="text-[11px] text-amber-300">Bật âm thanh</span>
                </>
              ) : (
                <>
                  <Volume2 size={15} />
                  <span className="text-[11px]">Tắt tiếng</span>
                </>
              )}
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
