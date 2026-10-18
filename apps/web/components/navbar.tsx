"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Clock3,
  LogOut,
  Search,
  UserCircle,
  X,
  Film,
  ChevronDown,
  Sparkles,
  Tv,
  Clapperboard,
  Flame,
  Menu,
  TrendingUp,
  Bookmark,
  Bell,
  Shield,
  KeyRound,
  User,
} from "lucide-react";
import { useMember } from "./member-provider";
import { searchMovies, type ListMovie } from "@/lib/ophim-client";
import { isAdminUser } from "@/lib/member-client";
import { Po3nHubLogo } from "./po3nhub-brand";

const GENRES = [
  { name: "Hành Động", slug: "hanh-dong" },
  { name: "Cổ Trang", slug: "co-trang" },
  { name: "Tình Cảm", slug: "tinh-cam" },
  { name: "Hài Hước", slug: "hai-huoc" },
  { name: "Kinh Dị", slug: "kinh-di" },
  { name: "Võ Thuật", slug: "vo-thuat" },
  { name: "Viễn Tưởng", slug: "vien-tuong" },
  { name: "Hình Sự", slug: "hinh-su" },
  { name: "Tâm Lý", slug: "tam-ly" },
  { name: "Học Đường", slug: "hoc-duong" },
  { name: "Phiêu Lưu", slug: "phieu-luu" },
  { name: "Chiến Tranh", slug: "chien-tranh" },
  { name: "Gia Đình", slug: "gia-dinh" },
  { name: "Khoa Học", slug: "khoa-hoc" },
];

const COUNTRIES = [
  { name: "Hàn Quốc", slug: "han-quoc", flag: "🇰🇷" },
  { name: "Trung Quốc", slug: "trung-quoc", flag: "🇨🇳" },
  { name: "Âu Mỹ", slug: "au-my", flag: "🇺🇸" },
  { name: "Nhật Bản", slug: "nhat-ban", flag: "🇯🇵" },
  { name: "Thái Lan", slug: "thai-lan", flag: "🇹🇭" },
  { name: "Việt Nam", slug: "viet-nam", flag: "🇻🇳" },
  { name: "Đài Loan", slug: "dai-loan", flag: "🇹🇼" },
  { name: "Hồng Kông", slug: "hong-kong", flag: "🇭🇰" },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileGenreOpen, setIsMobileGenreOpen] = useState(true);
  const [isMobileCountryOpen, setIsMobileCountryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ListMovie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showLiveSearch, setShowLiveSearch] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const {
    user,
    openAuth,
    openLibrary,
    openProfile,
    openChangePassword,
    logout,
  } = useMember();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close overlays on route change
  useEffect(() => {
    setIsMobileDrawerOpen(false);
    setShowLiveSearch(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Debounced live search
  useEffect(() => {
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery || cleanQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchMovies(cleanQuery, 1, 6);
        if (res && res.status && res.items) {
          setSearchResults(res.items.slice(0, 5));
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search & user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowLiveSearch(false);
        if (!searchQuery) {
          setIsSearchExpanded(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowLiveSearch(false);
      router.push(`/tim-kiem?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 select-none ${
          isScrolled
            ? "bg-[#141414]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_15px_35px_rgba(0,0,0,0.9)] py-2.5 sm:py-3"
            : "bg-gradient-to-b from-black/90 via-black/40 to-transparent py-3 sm:py-5"
        }`}
      >
        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Brand Logo & Desktop Navigation */}
          <div className="flex items-center gap-4 sm:gap-8">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              aria-label="Mở menu"
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white transition-colors"
            >
              <Menu size={19} />
            </button>

            {/* Po3nHub Brand Logo */}
            <Po3nHubLogo size="md" showOriginalTag={false} />

            {/* Desktop Navigation Links (Netflix Style) */}
            <nav className="hidden lg:flex items-center gap-1.5 ml-2">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  pathname === "/"
                    ? "text-white font-bold"
                    : "text-gray-300 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                Trang Chủ
              </Link>

              <Link
                href="/danh-sach/phim-bo"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === "/danh-sach/phim-bo"
                    ? "text-white font-bold"
                    : "text-gray-300 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                Phim Bộ
              </Link>

              <Link
                href="/danh-sach/phim-le"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === "/danh-sach/phim-le"
                    ? "text-white font-bold"
                    : "text-gray-300 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                Phim Lẻ
              </Link>

              <Link
                href="/danh-sach/hoat-hinh"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === "/danh-sach/hoat-hinh"
                    ? "text-white font-bold"
                    : "text-gray-300 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                Hoạt Hình
              </Link>

              <Link
                href="/gioi-thieu"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === "/gioi-thieu"
                    ? "text-white font-bold"
                    : "text-gray-300 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                Giới thiệu
              </Link>

              {/* Thể Loại Mega Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 group-hover:text-white group-hover:bg-white/[0.06] transition-all">
                  <span>Thể Loại</span>
                  <ChevronDown
                    size={14}
                    className="text-gray-400 group-hover:rotate-180 group-hover:text-white transition-transform duration-200"
                  />
                </button>
                <div className="absolute top-full left-0 mt-2 w-80 bg-[#12131a] border border-white/15 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.98)] backdrop-blur-3xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-2 py-1.5 mb-1.5 border-b border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#FF4D4D] flex items-center gap-1.5">
                      <Sparkles size={12} />
                      Khám phá theo thể loại
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 max-h-72 overflow-y-auto custom-scrollbar">
                    {GENRES.map((g) => (
                      <Link
                        key={g.slug}
                        href={`/the-loai/${g.slug}`}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          pathname === `/the-loai/${g.slug}`
                            ? "bg-[#E50914] text-white font-bold shadow-md"
                            : "text-gray-200 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {g.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quốc Gia Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 group-hover:text-white group-hover:bg-white/[0.06] transition-all">
                  <span>Quốc Gia</span>
                  <ChevronDown
                    size={14}
                    className="text-gray-400 group-hover:rotate-180 group-hover:text-white transition-transform duration-200"
                  />
                </button>
                <div className="absolute top-full left-0 mt-2 w-56 bg-[#12131a] border border-white/15 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.98)] backdrop-blur-3xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="grid grid-cols-1 gap-1">
                    {COUNTRIES.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/quoc-gia/${c.slug}`}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          pathname === `/quoc-gia/${c.slug}`
                            ? "bg-[#E50914] text-white font-bold"
                            : "text-gray-200 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </nav>
          </div>

          {/* Right: Search, Notifications & User Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Netflix Expanding Search Bar */}
            <div ref={searchContainerRef} className="relative">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <div
                  className={`flex items-center overflow-hidden transition-all duration-300 rounded-full ${
                    isSearchExpanded
                      ? "w-36 xs:w-48 sm:w-64 bg-black/95 border border-white/30 px-2.5 sm:px-3 py-1.5 shadow-lg"
                      : "w-9 h-9 bg-transparent hover:bg-white/[0.08] justify-center cursor-pointer"
                  }`}
                  onClick={() => {
                    if (!isSearchExpanded) {
                      setIsSearchExpanded(true);
                      setTimeout(() => searchInputRef.current?.focus(), 150);
                    }
                  }}
                >
                  <Search
                    size={17}
                    className={`shrink-0 transition-colors ${
                      isSearchExpanded ? "text-gray-400 mr-2" : "text-white"
                    }`}
                  />
                  {isSearchExpanded && (
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Tìm phim, diễn viên..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowLiveSearch(true);
                      }}
                      className="w-full min-w-0 bg-transparent text-xs text-white placeholder-gray-400 outline-none"
                    />
                  )}
                  {isSearchExpanded && searchQuery && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="text-gray-400 hover:text-white p-0.5 ml-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </form>

              {/* Live Search Modal Dropdown */}
              {showLiveSearch && searchQuery.trim().length >= 2 && (
                <div className="absolute top-full right-0 mt-3 w-[min(92vw,380px)] bg-[#12131a] border border-white/15 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.98)] backdrop-blur-3xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3 border-b border-white/[0.08] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#FF4D4D] flex items-center gap-1.5">
                      <Film size={13} />
                      Gợi ý tìm kiếm
                    </span>
                    {isSearching && (
                      <span className="text-[10px] text-white/40 animate-pulse">Đang tìm...</span>
                    )}
                  </div>

                  <div className="max-h-[320px] overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                    {searchResults.length > 0 ? (
                      searchResults.map((item) => (
                        <Link
                          key={item._id}
                          href={`/phim/${item.slug}`}
                          onClick={() => setShowLiveSearch(false)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.08] transition-all group"
                        >
                          <div className="relative w-11 h-15 rounded-md overflow-hidden bg-black/60 shrink-0 border border-white/10">
                            <Image
                              src={item.poster_url}
                              alt={item.name}
                              fill
                              sizes="44px"
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-[#FF4D4D] transition-colors">
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-gray-400 truncate mt-0.5">
                              {item.origin_name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[9px] font-bold text-[#E50914] bg-red-600/10 px-1.5 py-0.5 rounded">
                                {item.year || "2026"}
                              </span>
                              <span className="text-[9px] font-medium text-white/60 bg-white/10 px-1.5 py-0.5 rounded">
                                Ultra HD
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : !isSearching ? (
                      <div className="py-8 text-center text-xs text-gray-400">
                        Không tìm thấy phim phù hợp
                      </div>
                    ) : null}
                  </div>

                  <Link
                    href={`/tim-kiem?keyword=${encodeURIComponent(searchQuery.trim())}`}
                    onClick={() => setShowLiveSearch(false)}
                    className="block p-2.5 text-center bg-white/[0.04] hover:bg-[#E50914] text-xs font-bold text-white transition-all border-t border-white/[0.08]"
                  >
                    Xem tất cả kết quả &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* Notification Bell (Netflix style) */}
            <button
              aria-label="Thông báo phim mới"
              className="w-9 h-9 rounded-full hover:bg-white/[0.08] flex items-center justify-center text-gray-300 hover:text-white transition-colors relative"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E50914] shadow-[0_0_6px_#E50914]" />
            </button>

            {/* Member Profile */}
            {user ? (
              <div className="flex items-center gap-2">
                {isAdminUser(user) && (
                  <Link
                    href="/admin"
                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600/20 border border-red-500/40 text-[#FF4D4D] text-xs font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm"
                  >
                    <Shield size={12} />
                    <span>Admin</span>
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 rounded-md p-1 hover:bg-white/[0.08] transition-all"
                  >
                    <div className="w-8 h-8 rounded bg-gradient-to-tr from-[#E50914] to-[#B81D24] text-white font-black text-xs flex items-center justify-center shadow-md border border-white/20">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown
                      size={13}
                      className={`text-gray-400 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                <div
                  className={`absolute right-0 top-full mt-2.5 w-56 overflow-hidden rounded-2xl border border-white/15 bg-[#12131a] shadow-[0_25px_60px_rgba(0,0,0,0.98)] backdrop-blur-3xl transition-all z-50 ${
                    isUserMenuOpen
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-2 pointer-events-none opacity-0"
                  }`}
                >
                  <div className="border-b border-white/[0.08] p-3 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded bg-[#E50914] text-white font-black text-sm flex items-center justify-center shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-white">{user.name}</p>
                      <p className="truncate text-[10px] text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        openProfile();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs text-gray-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                    >
                      <User size={14} className="text-[#E50914]" />
                      Hồ sơ cá nhân
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        openLibrary("favorites");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs text-gray-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                    >
                      <Bookmark size={14} className="text-[#E50914]" />
                      Phim đã lưu
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        openLibrary("history");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs text-gray-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                    >
                      <Clock3 size={14} className="text-[#E50914]" />
                      Lịch sử xem
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        openChangePassword();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs text-gray-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                    >
                      <KeyRound size={14} className="text-amber-400" />
                      Đổi mật khẩu
                    </button>
                    {isAdminUser(user) && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 font-bold transition-colors"
                      >
                        <Shield size={14} className="text-[#E50914]" />
                        Trang Quản Trị
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        void logout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      Đăng xuất
                    </button>
                  </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth("login")}
                  className="flex h-8 sm:h-9 items-center gap-1.5 rounded-md bg-[#E50914] hover:bg-[#FF1E27] px-3.5 sm:px-4 text-white text-xs font-bold transition-all shadow-[0_2px_12px_rgba(229,9,20,0.5)] transform hover:scale-105 active:scale-95"
                >
                  <UserCircle size={15} />
                  <span>Đăng Nhập</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-Over Mobile Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden animate-in fade-in duration-200">
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 left-0 w-[min(85vw,320px)] bg-[#12131a] border-r border-white/15 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-left duration-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
              <Po3nHubLogo size="sm" />
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="h-8 w-8 rounded-full bg-white/[0.08] flex items-center justify-center text-white/70 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* User Profile Bar */}
            <div className="p-3.5 border-b border-white/[0.08] bg-white/[0.02]">
              {user ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        void logout();
                      }}
                      className="text-[10px] text-red-400 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 font-medium cursor-pointer"
                    >
                      Đăng xuất
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-white/5">
                    <button
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        openProfile();
                      }}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[11px] font-semibold"
                    >
                      <User size={12} className="text-[#E50914]" />
                      <span>Hồ sơ</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        openChangePassword();
                      }}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[11px] font-semibold"
                    >
                      <KeyRound size={12} className="text-amber-400" />
                      <span>Đổi MK</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    openAuth("login");
                  }}
                  className="w-full h-9 rounded-md bg-[#E50914] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <UserCircle size={15} />
                  Đăng nhập / Đăng ký
                </button>
              )}
            </div>

            {/* Navigation Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    pathname === "/" ? "bg-[#E50914] text-white font-bold" : "text-gray-300 hover:bg-white/[0.06]"
                  }`}
                >
                  <Flame size={14} className={pathname === "/" ? "text-white" : "text-[#E50914]"} />
                  Trang Chủ
                </Link>
                <Link
                  href="/danh-sach/phim-bo"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    pathname === "/danh-sach/phim-bo" ? "bg-[#E50914] text-white font-bold" : "text-gray-300 hover:bg-white/[0.06]"
                  }`}
                >
                  <Tv size={14} className={pathname === "/danh-sach/phim-bo" ? "text-white" : "text-[#E50914]"} />
                  Phim Bộ
                </Link>
                <Link
                  href="/danh-sach/phim-le"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    pathname === "/danh-sach/phim-le" ? "bg-[#E50914] text-white font-bold" : "text-gray-300 hover:bg-white/[0.06]"
                  }`}
                >
                  <Clapperboard size={14} className={pathname === "/danh-sach/phim-le" ? "text-white" : "text-[#E50914]"} />
                  Phim Lẻ
                </Link>
                <Link
                  href="/danh-sach/hoat-hinh"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    pathname === "/danh-sach/hoat-hinh" ? "bg-[#E50914] text-white font-bold" : "text-gray-300 hover:bg-white/[0.06]"
                  }`}
                >
                  <Sparkles size={14} className={pathname === "/danh-sach/hoat-hinh" ? "text-white" : "text-[#E50914]"} />
                  Hoạt Hình & Anime
                </Link>
                <Link
                  href="/danh-sach/phim-moi"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    pathname === "/danh-sach/phim-moi" ? "bg-[#E50914] text-white font-bold" : "text-gray-300 hover:bg-white/[0.06]"
                  }`}
                >
                  <TrendingUp size={14} className={pathname === "/danh-sach/phim-moi" ? "text-white" : "text-[#E50914]"} />
                  Phim Mới Cập Nhật
                </Link>
                <Link
                  href="/gioi-thieu"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    pathname === "/gioi-thieu" ? "bg-[#E50914] text-white font-bold" : "text-gray-300 hover:bg-white/[0.06]"
                  }`}
                >
                  <Film size={14} className={pathname === "/gioi-thieu" ? "text-white" : "text-[#E50914]"} />
                  Giới thiệu Po3nHub
                </Link>
                {isAdminUser(user) && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 transition-colors"
                  >
                    <Shield size={14} className="text-[#E50914]" />
                    Trang Quản Trị
                  </Link>
                )}
              </div>

              {/* Thể Loại */}
              <div className="border-t border-white/[0.08] pt-3">
                <button
                  onClick={() => setIsMobileGenreOpen(!isMobileGenreOpen)}
                  className="w-full flex items-center justify-between px-2 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider"
                >
                  <span>Thể Loại</span>
                  <ChevronDown size={13} className={`transition-transform ${isMobileGenreOpen ? "rotate-180" : ""}`} />
                </button>
                {isMobileGenreOpen && (
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    {GENRES.map((g) => (
                      <Link
                        key={g.slug}
                        href={`/the-loai/${g.slug}`}
                        onClick={() => setIsMobileDrawerOpen(false)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs truncate transition-all ${
                          pathname === `/the-loai/${g.slug}`
                            ? "bg-[#E50914] text-white font-bold"
                            : "bg-white/[0.04] text-gray-300 hover:bg-white/[0.08]"
                        }`}
                      >
                        {g.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Quốc Gia */}
              <div className="border-t border-white/[0.08] pt-3">
                <button
                  onClick={() => setIsMobileCountryOpen(!isMobileCountryOpen)}
                  className="w-full flex items-center justify-between px-2 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider"
                >
                  <span>Quốc Gia</span>
                  <ChevronDown size={13} className={`transition-transform ${isMobileCountryOpen ? "rotate-180" : ""}`} />
                </button>
                {isMobileCountryOpen && (
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    {COUNTRIES.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/quoc-gia/${c.slug}`}
                        onClick={() => setIsMobileDrawerOpen(false)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs truncate transition-all ${
                          pathname === `/quoc-gia/${c.slug}`
                            ? "bg-[#E50914] text-white font-bold"
                            : "bg-white/[0.04] text-gray-300 hover:bg-white/[0.08]"
                        }`}
                      >
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/[0.08] text-center text-[10px] text-gray-500">
              Po3nHub © 2026 — Trải nghiệm điện ảnh đỉnh cao
            </div>
          </div>
        </div>
      )}
    </>
  );
};
