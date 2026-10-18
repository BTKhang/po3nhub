"use client";

import { useEffect, useState } from "react";
import { NetflixHeroBillboard } from "@/components/netflix-hero-billboard";
import { NetflixMovieRow } from "@/components/netflix-movie-row";
import { NetflixTop10Row } from "@/components/netflix-top10-row";
import { NetflixCategoriesBanner } from "@/components/netflix-categories-banner";
import { GhibliSection } from "@/components/ghibli-section";
import {
  getLatestMovies,
  getMoviesByType,
  getMoviesByCountry,
  getMoviesByCategory,
  searchMovies,
  type ListMovie,
} from "@/lib/ophim-client";
import { Sparkles, Film, Flame } from "lucide-react";

export default function Home() {
  const [data, setData] = useState<{
    latest: ListMovie[];
    korean: ListMovie[];
    chinese: ListMovie[];
    usuk: ListMovie[];
    series: ListMovie[];
    single: ListMovie[];
    cartoon: ListMovie[];
    cinema: ListMovie[];
    japanese: ListMovie[];
    thai: ListMovie[];
    hongkong: ListMovie[];
    costume: ListMovie[];
    horror: ListMovie[];
    romance: ListMovie[];
    hero: ListMovie[];
  }>({
    latest: [],
    korean: [],
    chinese: [],
    usuk: [],
    series: [],
    single: [],
    cartoon: [],
    cinema: [],
    japanese: [],
    thai: [],
    hongkong: [],
    costume: [],
    horror: [],
    romance: [],
    hero: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          latestRes,
          koreanRes,
          chineseRes,
          usukRes,
          seriesRes,
          singleRes,
          cartoonRes,
          cinemaRes,
          japaneseRes,
          thaiRes,
          hongkongRes,
          costumeRes,
          horrorRes,
          romanceRes,
          fixed1,
          fixed2,
          fixed3,
          fixed4,
          fixed5,
          fixed6,
        ] = await Promise.all([
          getLatestMovies(1),
          getMoviesByCountry("han-quoc", 1, true),
          getMoviesByCountry("trung-quoc", 1, true),
          getMoviesByCountry("au-my", 1, true),
          getMoviesByType("phim-bo", 1, true),
          getMoviesByType("phim-le", 1, true),
          getMoviesByType("hoat-hinh", 1, true),
          getMoviesByType("phim-sap-chieu", 1, true),
          getMoviesByCountry("nhat-ban", 1, true),
          getMoviesByCountry("thai-lan", 1, true),
          getMoviesByCountry("hong-kong", 1, true),
          getMoviesByCategory("co-trang", 1, true),
          getMoviesByCategory("kinh-di", 1, true),
          getMoviesByCategory("tinh-cam", 1, true),
          searchMovies("Còn ra thể thống gì nữa", 1, 1, true),
          searchMovies("Sự trở lại của thẩm phán", 1, 1, true),
          searchMovies("mùa hè những năm 80", 1, 1, true),
          searchMovies("nghệ thuật lừa dối của sarah", 1, 1, true),
          searchMovies("bake your dream", 1, 1, true),
          searchMovies("phong lâm hỏa sơn", 1, 1, true),
        ]);

        const userFixedItems: ListMovie[] = [];
        const searchResults = [fixed1, fixed2, fixed3, fixed4, fixed5, fixed6];

        searchResults.forEach((res) => {
          const firstMovie = res?.items?.[0];
          if (firstMovie) {
            if (
              !userFixedItems.some(
                (existing) => existing._id === firstMovie._id || existing.slug === firstMovie.slug,
              )
            ) {
              userFixedItems.push(firstMovie);
            }
          }
        });

        const heroPool = [
          ...userFixedItems,
          ...(latestRes?.items || []),
          ...(seriesRes?.items || []),
          ...(singleRes?.items || []),
        ];

        const curatedHero = Array.from(
          new Map(heroPool.map((m) => [m.slug || m._id, m])).values(),
        ).slice(0, 8);

        setData({
          latest: latestRes?.items || [],
          korean: koreanRes?.items || [],
          chinese: chineseRes?.items || [],
          usuk: usukRes?.items || [],
          series: seriesRes?.items || [],
          single: singleRes?.items || [],
          cartoon: cartoonRes?.items || [],
          cinema: (cinemaRes?.items?.length ? cinemaRes.items : singleRes?.items) || [],
          japanese: japaneseRes?.items || [],
          thai: thaiRes?.items || [],
          hongkong: hongkongRes?.items || [],
          costume: costumeRes?.items || [],
          horror: horrorRes?.items || [],
          romance: romanceRes?.items || [],
          hero: curatedHero,
        });
      } catch (error) {
        console.error("Failed to fetch movies", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const uniqueMovies = (movies: ListMovie[]) => {
    return Array.from(
      new Map((movies || []).map((movie) => [movie._id || movie.slug, movie])),
    ).map(([, movie]) => movie);
  };

  const transformMovies = (movies: ListMovie[]) => {
    return uniqueMovies(movies).map((m) => ({
      id: m._id,
      title: m.name,
      originalTitle: m.origin_name,
      posterUrl: m.poster_url,
      thumbUrl: m.thumb_url,
      slug: m.slug,
      year: m.year,
      quality: m.quality || "4K Ultra HD",
      language: m.lang || "Vietsub",
      episodeCurrent: m.episode_current,
      view: m.view,
      rating: m.rating || 9.5,
      isSeries: false,
    }));
  };

  return (
    <main className="min-h-screen text-white font-sans overflow-x-hidden selection:bg-[#E50914] selection:text-white">
      {/* Netflix 3D Hero Billboard */}
      <NetflixHeroBillboard movies={data.hero} />

      {/* Main Content Rows */}
      <div className="flex flex-col gap-4 pb-24 -mt-4 md:-mt-6 relative z-30">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-48 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-3 border-[#E50914] border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 rounded-full blur-md bg-[#E50914]/20 animate-pulse pointer-events-none" />
            </div>
            <p className="text-gray-400 text-xs sm:text-sm font-semibold tracking-wide">
              Đang tải danh sách phim...
            </p>
          </div>
        ) : (
          <>
            {/* Categories Banner */}
            <NetflixCategoriesBanner />

            <div className="space-y-4 md:space-y-8">
              {/* Top 10 Trending */}
              <NetflixTop10Row
                title="Top 10 Phim Thịnh Hành Hôm Nay"
                items={transformMovies(
                  uniqueMovies([...data.latest, ...data.series, ...data.single])
                    .sort((a, b) => (b.view || 0) - (a.view || 0))
                    .slice(0, 10),
                )}
              />

              {/* Phim Mới Cập Nhật */}
              <NetflixMovieRow
                title="Phim Mới Cập Nhật"
                icon="🔥"
                badgeText="Mới Nhất"
                viewMoreLink="/danh-sach/phim-moi"
                items={transformMovies(data.latest)}
              />

              {/* Phim Chiếu Rạp */}
              <NetflixMovieRow
                title="Phim Chiếu Rạp"
                icon="🍿"
                badgeText="Bản Đẹp"
                viewMoreLink="/danh-sach/phim-le"
                items={transformMovies(data.single)}
              />

              {/* Phim Hàn Quốc */}
              <NetflixMovieRow
                title="Phim Hàn Quốc Nổi Bật"
                icon="🇰🇷"
                badgeText="K-Drama"
                viewMoreLink="/quoc-gia/han-quoc"
                items={transformMovies(data.korean)}
              />

              {/* Phim Âu Mỹ US-UK */}
              <NetflixMovieRow
                title="Bom Tấn Hollywood & US-UK"
                icon="🇺🇸"
                badgeText="Hollywood"
                viewMoreLink="/quoc-gia/au-my"
                items={transformMovies(data.usuk)}
              />

              {/* TOP 10 PHIM BỘ HÔM NAY - Netflix Giant 3D Numbers */}
              <NetflixTop10Row
                title="Top 10 Phim Bộ Được Xem Nhiều Nhất"
                items={transformMovies(
                  [...data.series].sort((a, b) => (b.view || 0) - (a.view || 0)).slice(0, 10),
                )}
              />

              {/* Phim Trung Quốc */}
              <NetflixMovieRow
                title="Phim Truyền Hình & Cổ Trang Hoa Ngữ"
                icon="🇨🇳"
                viewMoreLink="/quoc-gia/trung-quoc"
                items={transformMovies(data.chinese)}
              />

              {/* Anime & Hoạt hình */}
              <NetflixMovieRow
                title="Anime Tuyển Chọn & Hoạt Hình 3D"
                icon="⚡"
                badgeText="Anime VIP"
                viewMoreLink="/danh-sach/hoat-hinh"
                items={transformMovies(data.cartoon)}
              />

              {/* Phim Nhật Bản */}
              <NetflixMovieRow
                title="Điện Ảnh Nhật Bản Độc Đáo"
                icon="🍣"
                viewMoreLink="/quoc-gia/nhat-ban"
                items={transformMovies(data.japanese)}
              />

              {/* Phim Thái Lan */}
              <NetflixMovieRow
                title="Phim Thái Lan Kịch Tính & Drama"
                icon="🐘"
                viewMoreLink="/quoc-gia/thai-lan"
                items={transformMovies(data.thai)}
              />

              {/* Phim Kinh Dị & Giật Gân */}
              <NetflixMovieRow
                title="Phim Kinh Dị Rợn Tóc Gáy"
                icon="💀"
                badgeText="18+"
                viewMoreLink="/the-loai/kinh-di"
                items={transformMovies(data.horror)}
              />

              {/* Phim Tình Cảm Lãng Mạn */}
              <NetflixMovieRow
                title="Phim Tình Cảm Ngọt Ngào"
                icon="💖"
                viewMoreLink="/the-loai/tinh-cam"
                items={transformMovies(data.romance)}
              />

              {/* Phim Hồng Kông */}
              <NetflixMovieRow
                title="Kinh Điển Hồng Kông TVB & Võ Thuật"
                icon="🐲"
                viewMoreLink="/quoc-gia/hong-kong"
                items={transformMovies(data.hongkong)}
              />

              {/* Ghibli Studio Masterpieces */}
              <GhibliSection />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
