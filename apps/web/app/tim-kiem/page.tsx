"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { InfiniteMovieGrid } from "@/components/infinite-movie-grid";
import { FilterBar } from "@/components/filter-bar";
import { searchMovies, type ListMovie } from "@/lib/ophim-client";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("keyword");
  const [results, setResults] = useState<ListMovie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const res = await searchMovies(query, 1, 24);
        if (res.status) {
          setResults(res.items);
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="pt-24 container mx-auto px-4 lg:px-8 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black uppercase flex items-center gap-2">
          Kết quả tìm kiếm cho:{" "}
          <span className="text-[#FF4D4D]">&quot;{query}&quot;</span>
        </h1>
        <p className="text-gray-400 text-xs font-semibold mt-1">
          Tìm thấy {results.length} bộ phim phù hợp
        </p>
      </div>

      <FilterBar />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-10 h-10 border-3 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-xs font-semibold">
            Đang tìm kiếm phim...
          </p>
        </div>
      ) : results.length > 0 ? (
        <InfiniteMovieGrid
          initialItems={results}
          initialTotalPages={10}
          fetchMore={(page) => searchMovies(query || "", page, 24)}
        />
      ) : (
        <div className="text-center py-24 bg-white/[0.02] rounded-2xl border border-white/10">
          <p className="text-gray-400 text-sm font-medium">
            Không tìm thấy phim nào phù hợp với từ khóa &quot;{query}&quot;.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[#0b0d14] text-white">
      <Suspense fallback={<div>Loading search...</div>}>
        <SearchContent />
      </Suspense>
    </main>
  );
}
