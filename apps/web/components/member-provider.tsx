"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  X,
  User,
  KeyRound,
  Shield,
  Film,
  Clock3,
  Calendar,
  Mail,
  CheckCircle2,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  memberClient,
  type FavoriteItem,
  type MemberUser,
  type WatchHistoryItem,
  isAdminUser,
} from "@/lib/member-client";

interface MemberContextValue {
  user: MemberUser | null;
  loading: boolean;
  openAuth: (mode?: "login" | "register") => void;
  openLibrary: (view: "favorites" | "history") => void;
  openProfile: () => void;
  openChangePassword: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const MemberContext = createContext<MemberContextValue | null>(null);

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<MemberUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [libraryView, setLibraryView] = useState<"favorites" | "history" | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const result = await memberClient.me();
      setUser(result.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const openAuth = useCallback((mode: "login" | "register" = "login") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  }, []);

  const logout = useCallback(async () => {
    await memberClient.logout();
    setUser(null);
  }, []);

  const openLibrary = useCallback((view: "favorites" | "history") => {
    setLibraryView(view);
  }, []);

  const openProfile = useCallback(() => {
    setIsProfileOpen(true);
  }, []);

  const openChangePassword = useCallback(() => {
    setIsChangePasswordOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      openAuth,
      openLibrary,
      openProfile,
      openChangePassword,
      logout,
      refreshUser,
    }),
    [
      user,
      loading,
      openAuth,
      openLibrary,
      openProfile,
      openChangePassword,
      logout,
      refreshUser,
    ],
  );

  return (
    <MemberContext.Provider value={value}>
      {children}
      <MemberAuthModal
        mode={authMode}
        open={isAuthOpen}
        onModeChange={setAuthMode}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={(nextUser) => {
          setUser(nextUser);
          setIsAuthOpen(false);
          if (pathname === "/admin" && !isAdminUser(nextUser)) {
            router.push("/");
          }
        }}
      />
      <MemberLibraryModal
        view={libraryView}
        onClose={() => setLibraryView(null)}
      />
      {isProfileOpen && user && (
        <MemberProfileModal
          user={user}
          onClose={() => setIsProfileOpen(false)}
          onChangePasswordClick={() => {
            setIsProfileOpen(false);
            setIsChangePasswordOpen(true);
          }}
          onOpenFavorites={() => {
            setIsProfileOpen(false);
            setLibraryView("favorites");
          }}
          onOpenHistory={() => {
            setIsProfileOpen(false);
            setLibraryView("history");
          }}
        />
      )}
      {isChangePasswordOpen && (
        <MemberChangePasswordModal
          onClose={() => setIsChangePasswordOpen(false)}
        />
      )}
    </MemberContext.Provider>
  );
}

export function useMember() {
  const context = useContext(MemberContext);
  if (!context) {
    throw new Error("useMember must be used inside MemberProvider");
  }
  return context;
}

// 1. LIBRARY MODAL (FAVORITES & HISTORY)
function MemberLibraryModal({
  view,
  onClose,
}: {
  view: "favorites" | "history" | null;
  onClose: () => void;
}) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!view) return;
    let cancelled = false;

    const loadItems = async () => {
      setLoading(true);
      try {
        if (view === "favorites") {
          const result = await memberClient.favorites();
          if (!cancelled) setFavorites(result.items);
        } else {
          const result = await memberClient.history();
          if (!cancelled) setHistory(result.items);
        }
      } catch {
        if (!cancelled) {
          setFavorites([]);
          setHistory([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadItems();
    return () => {
      cancelled = true;
    };
  }, [view]);

  if (!view) return null;

  const title = view === "favorites" ? "Phim đã lưu" : "Lịch sử xem";
  const items = view === "favorites" ? favorites : history;

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-white/10 bg-[#12131a] shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>

          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#FF4D4D]">
            Po3nHub Cinema
          </p>
          <h2 className="mb-4 text-2xl font-black text-white">{title}</h2>

          {loading ? (
            <div className="flex h-44 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E50914] border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-gray-400">
              {view === "favorites"
                ? "Bạn chưa lưu bộ phim nào. Hãy bấm lưu phim để xem lại bất cứ lúc nào."
                : "Chưa có lịch sử xem phim nào được ghi nhận."}
            </div>
          ) : (
            <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              {view === "favorites"
                ? favorites.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.08]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {item.movieTitle}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          Đã lưu: {item.createdAt}
                        </p>
                      </div>
                      <Link
                        href={`/phim/${item.movieSlug}`}
                        onClick={onClose}
                        className="shrink-0 rounded-lg bg-[#E50914] px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-[#ff1f2d]"
                      >
                        Xem phim
                      </Link>
                    </div>
                  ))
                : history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.08]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {item.movieTitle}
                        </p>
                        <p className="text-[11px] text-[#FF4D4D] font-medium">
                          {item.episodeName} • Cập nhật: {item.updatedAt}
                        </p>
                      </div>
                      <Link
                        href={`/xem-phim/${item.movieSlug}`}
                        onClick={onClose}
                        className="shrink-0 rounded-lg bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
                      >
                        Xem tiếp
                      </Link>
                    </div>
                  ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 2. USER PROFILE MODAL (Xem hồ sơ cá nhân)
function MemberProfileModal({
  user,
  onClose,
  onChangePasswordClick,
  onOpenFavorites,
  onOpenHistory,
}: {
  user: MemberUser;
  onClose: () => void;
  onChangePasswordClick: () => void;
  onOpenFavorites: () => void;
  onOpenHistory: () => void;
}) {
  const [favCount, setFavCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    memberClient.favorites().then((res) => setFavCount(res.items.length)).catch(() => {});
    memberClient.history().then((res) => setHistoryCount(res.items.length)).catch(() => {});
  }, []);

  const isAdmin = isAdminUser(user);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-[460px] overflow-hidden rounded-2xl border border-white/10 bg-[#12131a] shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative p-6 sm:p-7">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>

          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#FF4D4D]">
            Po3nHub Member
          </p>
          <h2 className="mb-5 text-2xl font-black text-white">Hồ sơ cá nhân</h2>

          {/* User Badge */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#E50914] to-[#B81D24] text-white font-black text-xl flex items-center justify-center shadow-lg border border-white/20 shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-white truncate">{user.name}</h3>
              <p className="text-xs text-gray-400 flex items-center gap-1.5 truncate mt-0.5">
                <Mail size={12} />
                <span>{user.email}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isAdmin
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  {isAdmin ? "Quản Trị Viên" : "Thành viên chính thức"}
                </span>
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Calendar size={10} />
                  <span>{user.createdAt || "Tham gia 2026"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={onOpenFavorites}
              className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-400">Phim đã lưu</span>
                <Film size={14} className="text-[#FF4D4D] group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-xl font-black text-white font-mono">{favCount}</div>
            </button>

            <button
              onClick={onOpenHistory}
              className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-400">Lịch sử xem</span>
                <Clock3 size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-xl font-black text-white font-mono">{historyCount}</div>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <button
              onClick={onChangePasswordClick}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all border border-white/5"
            >
              <KeyRound size={14} className="text-amber-400" />
              <span>Đổi mật khẩu tài khoản</span>
            </button>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-bold transition-all border border-red-500/30"
              >
                <Shield size={14} />
                <span>Truy cập Bảng điều khiển Quản trị</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. CHANGE PASSWORD MODAL (Đổi mật khẩu)
function MemberChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có tối thiểu 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu mới không trùng khớp");
      return;
    }

    setSubmitting(true);
    try {
      const res = await memberClient.changePassword({
        currentPassword,
        newPassword,
      });
      setSuccess(res.message);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đổi mật khẩu thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-[#12131a] shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
        <div className="relative p-6 sm:p-7">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>

          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#FF4D4D]">
            Bảo mật tài khoản
          </p>
          <h2 className="mb-2 text-2xl font-black text-white">Đổi mật khẩu</h2>
          <p className="mb-5 text-xs text-gray-400">
            Nhập mật khẩu hiện tại và tạo mật khẩu mới an toàn hơn.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              placeholder="Mật khẩu hiện tại"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-red-500"
              required
            />

            <input
              type="password"
              placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-red-500"
              required
            />

            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-red-500"
              required
            />

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-xl bg-[#E50914] text-sm font-bold text-white transition-all hover:bg-[#ff1f2d] shadow-lg shadow-red-900/30 disabled:opacity-60"
            >
              {submitting ? "Đang xử lý..." : "Lưu mật khẩu mới"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// 4. AUTH MODAL (LOGIN & REGISTER)
function MemberAuthModal({
  mode,
  open,
  onModeChange,
  onClose,
  onAuthenticated,
}: {
  mode: "login" | "register";
  open: boolean;
  onModeChange: (mode: "login" | "register") => void;
  onClose: () => void;
  onAuthenticated: (user: MemberUser) => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === "register";

  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
  }, [mode, open]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const result = isRegister
        ? await memberClient.register({ email, name, password })
        : await memberClient.login({ email, password });
      
      if (isRegister) {
        setSuccessMsg("Đăng ký tài khoản thành công! Đang chuyển hướng...");
        setTimeout(() => {
          onAuthenticated(result.user);
          setPassword("");
        }, 700);
      } else {
        onAuthenticated(result.user);
        setPassword("");
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể đăng nhập lúc này",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-[#12131a] shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative p-6 sm:p-7">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>

          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#FF4D4D]">
            Po3nHub Cinema
          </p>
          <h2 className="mb-2 text-2xl font-black text-white">
            {isRegister ? "Đăng ký thành viên" : "Đăng nhập"}
          </h2>
          <p className="mb-5 text-xs text-gray-400">
            Lưu danh sách phim yêu thích, xem tiếp tập đang dở và quản lý tài khoản.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegister && (
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-red-500"
                placeholder="Họ và tên của bạn"
                autoComplete="name"
                required
              />
            )}
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-red-500"
              placeholder="Email đăng ký"
              type="email"
              autoComplete="email"
              required
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-red-500"
              placeholder="Mật khẩu"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={6}
              required
            />

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-xl bg-[#E50914] text-sm font-bold text-white transition-all hover:bg-[#ff1f2d] shadow-lg shadow-red-900/30 disabled:opacity-60 cursor-pointer"
            >
              {submitting
                ? "Đang xử lý..."
                : isRegister
                  ? "Tạo tài khoản"
                  : "Đăng nhập ngay"}
            </button>
          </form>

          <button
            onClick={() => onModeChange(isRegister ? "login" : "register")}
            className="mt-4 w-full text-center text-xs font-semibold text-gray-400 transition-colors hover:text-white cursor-pointer"
          >
            {isRegister
              ? "Đã có tài khoản? Đăng nhập"
              : "Chưa có tài khoản? Đăng ký ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}
