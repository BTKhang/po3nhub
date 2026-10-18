"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Film,
  Activity,
  Trash2,
  Shield,
  RefreshCw,
  Search,
  CheckCircle,
  Play,
  Settings,
  Database,
  Sliders,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ArrowLeft,
  LogIn,
  KeyRound,
  Edit3,
  Plus,
  UserPlus,
  Check,
  AlertCircle,
  X,
  Clock,
  Bookmark,
  Sparkles,
  Video,
  ExternalLink,
} from "lucide-react";
import { Po3nHubLogo } from "@/components/po3nhub-brand";
import { useMember } from "@/components/member-provider";
import {
  isAdminUser,
  memberClient,
  type AccountRecord,
} from "@/lib/member-client";
import { getLatestMovies, type ListMovie } from "@/lib/ophim-client";
import {
  adsClient,
  type AdVideoCategory,
  type ManagedAdVideo,
} from "@/lib/ads-client";

export default function AdminDashboardPage() {
  const { user, loading: authLoading, openAuth, logout } = useMember();
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "movies" | "ads" | "database" | "settings"
  >("overview");

  // Real data state
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [realMovies, setRealMovies] = useState<ListMovie[]>([]);
  const [totalMoviesCount, setTotalMoviesCount] = useState<number>(0);
  const [totalFavoritesCount, setTotalFavoritesCount] = useState<number>(0);
  const [totalHistoryCount, setTotalHistoryCount] = useState<number>(0);
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [isLoadingRealData, setIsLoadingRealData] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [adVideos, setAdVideos] = useState<ManagedAdVideo[]>([]);
  const [isLoadingAdVideos, setIsLoadingAdVideos] = useState(false);
  const [isSavingAdVideo, setIsSavingAdVideo] = useState(false);
  const [adVideoError, setAdVideoError] = useState<string | null>(null);
  const [newAdVideo, setNewAdVideo] = useState<{
    title: string;
    url: string;
    category: AdVideoCategory;
  }>({ title: "", url: "", category: "ad" });

  // User management states
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [revealedPasswords, setRevealedPasswords] = useState<
    Record<string, boolean>
  >({});

  // Modals for editing / changing password / adding user
  const [editingAccount, setEditingAccount] = useState<AccountRecord | null>(
    null,
  );
  const [passwordModalAccount, setPasswordModalAccount] =
    useState<AccountRecord | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member" as "member" | "vip" | "admin",
  });

  // Load real data from storage & Ophim API
  const loadRealData = useCallback(async () => {
    setIsLoadingRealData(true);
    const startTime = Date.now();

    try {
      // 1. Fetch real accounts
      const accList = await memberClient.getAllAccounts();
      setAccounts(accList);

      // 2. Fetch real favorites and history counts
      const favRes = await memberClient.favorites();
      setTotalFavoritesCount(favRes.items.length);

      const histRes = await memberClient.history();
      setTotalHistoryCount(histRes.items.length);

      // 3. Fetch real movies from Ophim
      const moviesRes = await getLatestMovies(1);
      const latency = Date.now() - startTime;
      setApiLatency(latency);

      if (moviesRes && moviesRes.status) {
        setRealMovies(moviesRes.items || []);
        if (moviesRes.pagination?.totalItems) {
          setTotalMoviesCount(moviesRes.pagination.totalItems);
        } else {
          setTotalMoviesCount(moviesRes.items?.length || 24);
        }
      }
    } catch (err) {
      console.error("Error loading real data:", err);
    } finally {
      setIsLoadingRealData(false);
    }
  }, []);

  useEffect(() => {
    if (user && isAdminUser(user)) {
      void loadRealData();
    }
  }, [user, loadRealData]);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const loadAdVideos = useCallback(async () => {
    setIsLoadingAdVideos(true);
    setAdVideoError(null);
    try {
      setAdVideos(await adsClient.list());
    } catch (error) {
      setAdVideoError(
        error instanceof Error
          ? error.message
          : "Không tải được danh sách video quảng cáo",
      );
    } finally {
      setIsLoadingAdVideos(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "ads" && user && isAdminUser(user)) {
      void loadAdVideos();
    }
  }, [activeTab, user, loadAdVideos]);

  const handleAddAdVideo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingAdVideo(true);
    setAdVideoError(null);
    try {
      await adsClient.create(newAdVideo);
      setNewAdVideo({ title: "", url: "", category: "ad" });
      await loadAdVideos();
      showNotification("Đã thêm video vào danh sách phát quảng cáo.");
    } catch (error) {
      setAdVideoError(
        error instanceof Error ? error.message : "Không thể thêm video",
      );
    } finally {
      setIsSavingAdVideo(false);
    }
  };

  const handleDeleteAdVideo = async (video: ManagedAdVideo) => {
    if (!window.confirm(`Xóa video "${video.title}" khỏi danh sách?`)) return;
    setAdVideoError(null);
    try {
      await adsClient.remove(video.id);
      await loadAdVideos();
      showNotification("Đã xóa video khỏi danh sách.");
    } catch (error) {
      setAdVideoError(
        error instanceof Error ? error.message : "Không thể xóa video",
      );
    }
  };

  // Toggle reveal password
  const toggleRevealPassword = (id: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Change user password by Admin
  const handleAdminChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !passwordModalAccount ||
      !newPasswordInput ||
      newPasswordInput.length < 6
    ) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      await memberClient.adminUpdateAccount(passwordModalAccount.id, {
        password: newPasswordInput,
      });
      showNotification(
        `Đã đổi mật khẩu cho tài khoản ${passwordModalAccount.email} thành công!`,
      );
      setPasswordModalAccount(null);
      setNewPasswordInput("");
      await loadRealData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Đổi mật khẩu thất bại");
    }
  };

  // Update customer info by Admin
  const handleSaveCustomerInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    try {
      await memberClient.adminUpdateAccount(editingAccount.id, {
        name: editingAccount.name,
        email: editingAccount.email,
        role: editingAccount.role,
        status: editingAccount.status,
      });
      showNotification(
        `Đã cập nhật thông tin tài khoản ${editingAccount.email}!`,
      );
      setEditingAccount(null);
      await loadRealData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Cập nhật thất bại");
    }
  };

  // Toggle lock / unlock status
  const handleToggleLockStatus = async (account: AccountRecord) => {
    if (account.email === "buitan.khang.189@gmail.com") {
      alert("Không thể khóa tài khoản Quản trị viên Master!");
      return;
    }

    const nextStatus = account.status === "locked" ? "active" : "locked";
    try {
      await memberClient.adminUpdateAccount(account.id, {
        status: nextStatus,
      });
      showNotification(
        `Đã ${nextStatus === "locked" ? "khóa" : "mở khóa"} tài khoản ${account.email}!`,
      );
      await loadRealData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể đổi trạng thái");
    }
  };

  // Delete account by Admin
  const handleDeleteAccount = async (account: AccountRecord) => {
    if (account.email === "buitan.khang.189@gmail.com") {
      alert("Không được phép xóa tài khoản Quản trị viên Master!");
      return;
    }

    if (
      confirm(
        `Bạn có chắc chắn muốn xóa tài khoản khách hàng "${account.name}" (${account.email})?`,
      )
    ) {
      try {
        await memberClient.adminDeleteAccount(account.id);
        showNotification(`Đã xóa tài khoản ${account.email}!`);
        await loadRealData();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Xóa tài khoản thất bại");
      }
    }
  };

  // Create new account by Admin
  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email || !newUserForm.password) {
      alert("Vui lòng nhập đầy đủ họ tên, email và mật khẩu");
      return;
    }

    try {
      await memberClient.adminCreateAccount(newUserForm);
      showNotification(`Đã thêm tài khoản mới ${newUserForm.email}!`);
      setIsAddUserOpen(false);
      setNewUserForm({
        name: "",
        email: "",
        password: "",
        role: "member",
      });
      await loadRealData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Thêm tài khoản thất bại");
    }
  };

  // Reset database to real master admin state
  const handleResetData = async () => {
    const confirmation = prompt(
      "Xác nhận đặt lại dữ liệu: Thao tác này sẽ dọn dẹp các tài khoản thử nghiệm và đưa hệ thống về dữ liệu thực chuẩn (giữ lại Quản trị viên Master).\nNhập 'RESET' để tiếp tục:",
    );
    if (confirmation !== "RESET") return;

    await memberClient.resetToRealData();
    showNotification("Đã đặt lại dữ liệu hệ thống về dữ liệu thực thành công!");
    await loadRealData();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex flex-col items-center justify-center text-white px-4">
        <div className="w-12 h-12 border-3 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-400">Đang xác thực quyền truy cập...</p>
      </div>
    );
  }

  // Guard: Only allow authenticated admin accounts
  if (!user || !isAdminUser(user)) {
    const isMember = Boolean(user);

    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center px-4 py-20 select-none">
        <div className="max-w-md w-full bg-[#12131a] border border-white/10 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div
            className={`w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto mb-5 shadow-lg ${
              isMember
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                : "bg-red-600/10 border-red-500/20 text-[#E50914]"
            }`}
          >
            {isMember ? <CheckCircle size={32} /> : <Lock size={30} />}
          </div>

          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
              isMember
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
                : "text-red-400 bg-red-500/10 border-red-500/20"
            }`}
          >
            {isMember
              ? "Tài khoản Thành viên đã đăng nhập"
              : "Yêu cầu quyền Quản trị viên (403)"}
          </span>

          <h1 className="text-2xl font-black text-white mt-4 mb-2">
            {isMember
              ? `Chào bạn, ${user?.name || "Thành viên"}!`
              : "Khu vực Quản trị"}
          </h1>

          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            {isMember ? (
              <>
                Tài khoản <strong className="text-white">{user?.email}</strong>{" "}
                đã{" "}
                <span className="text-emerald-400 font-bold">
                  đăng ký thành công
                </span>{" "}
                và đang hoạt động tốt. Bạn có thể lưu phim yêu thích, xem phim
                và đổi mật khẩu tại trang chủ.
                <br />
                <span className="text-xs text-gray-500 block mt-2">
                  (Trang /admin là khu vực kỹ thuật dành riêng cho Quản trị viên
                  Master buitan.khang.189@gmail.com).
                </span>
              </>
            ) : (
              "Bạn cần đăng nhập tài khoản Quản trị viên để truy cập bảng điều khiển hệ thống Po3nHub."
            )}
          </p>

          <div className="space-y-3">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#E50914] hover:bg-[#ff1f2d] text-white text-sm font-bold transition-all shadow-lg shadow-red-950/50 cursor-pointer"
            >
              <Play size={16} />
              <span>Về trang chủ xem phim ngay</span>
            </Link>

            <button
              onClick={async () => {
                if (isMember) {
                  await logout();
                }
                openAuth("login");
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold transition-all border border-white/5 cursor-pointer"
            >
              <LogIn size={14} />
              <span>
                {isMember
                  ? "Đổi sang tài khoản Admin"
                  : "Đăng nhập tài khoản Admin"}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered accounts
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchUserQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || acc.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 font-sans pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Po3nHubLogo size="md" />
          <div className="h-6 w-px bg-white/20 hidden sm:block" />
          <span className="px-2.5 py-1 rounded-md bg-red-600/15 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Shield size={12} />
            Bảng điều khiển Quản trị
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:inline">
            Admin: <strong className="text-white">{user.email}</strong>
          </span>
          <button
            onClick={() => void loadRealData()}
            disabled={isLoadingRealData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold transition-all border border-white/10 cursor-pointer"
            title="Tải lại dữ liệu thực"
          >
            <RefreshCw
              size={13}
              className={isLoadingRealData ? "animate-spin text-red-500" : ""}
            />
            <span className="hidden sm:inline">Làm mới dữ liệu</span>
          </button>
          <Link
            href="/"
            className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition-all"
          >
            Về trang chủ
          </Link>
          <button
            onClick={() => void logout()}
            className="px-3.5 py-2 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-semibold transition-all border border-red-500/30 cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Action Notice Banner */}
      {actionNotice && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle size={16} />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mt-6 p-1.5 rounded-xl bg-white/[0.03] border border-white/10">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "overview"
              ? "bg-[#E50914] text-white shadow-md"
              : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
          }`}
        >
          <Activity size={15} />
          Tổng quan thực
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "users"
              ? "bg-[#E50914] text-white shadow-md"
              : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
          }`}
        >
          <Users size={15} />
          Quản lý Người dùng ({accounts.length})
        </button>

        <button
          onClick={() => setActiveTab("movies")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "movies"
              ? "bg-[#E50914] text-white shadow-md"
              : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
          }`}
        >
          <Film size={15} />
          Phim hệ thống ({realMovies.length})
        </button>

        <button
          onClick={() => setActiveTab("ads")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "ads"
              ? "bg-[#E50914] text-white shadow-md"
              : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
          }`}
        >
          <Video size={15} />
          Video quảng cáo ({adVideos.length})
        </button>

        <button
          onClick={() => setActiveTab("database")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "database"
              ? "bg-[#E50914] text-white shadow-md"
              : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
          }`}
        >
          <Database size={15} />
          Cơ sở dữ liệu
        </button>
      </div>

      {activeTab === "ads" && (
        <section className="mt-8 space-y-6">
          <div>
            <h2 className="text-xl font-black text-white">
              Quản lý video quảng cáo
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-400">
              Thêm URL trực tiếp đến file video MP4/WebM có thể phát công khai.
              Link chia sẻ Google Drive/YouTube không phải URL video trực tiếp.
              Video được lưu dùng chung trên hệ thống; Po3nHub chọn ngẫu nhiên
              intro ở đầu tập và video quảng cáo giữa phim.
            </p>
          </div>

          <form
            onSubmit={handleAddAdVideo}
            className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:grid-cols-[1fr_2fr_180px_auto] lg:items-end"
          >
            <label className="block space-y-2">
              <span className="text-xs font-bold text-gray-300">Tên video</span>
              <input
                value={newAdVideo.title}
                onChange={(event) =>
                  setNewAdVideo({ ...newAdVideo, title: event.target.value })
                }
                maxLength={100}
                required
                placeholder="Ví dụ: Intro thương hiệu"
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-500"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-bold text-gray-300">
                URL video trực tiếp
              </span>
              <input
                type="url"
                value={newAdVideo.url}
                onChange={(event) =>
                  setNewAdVideo({ ...newAdVideo, url: event.target.value })
                }
                required
                placeholder="https://example.com/video.mp4"
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-500"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-bold text-gray-300">Phân loại</span>
              <select
                value={newAdVideo.category}
                onChange={(event) =>
                  setNewAdVideo({
                    ...newAdVideo,
                    category: event.target.value as AdVideoCategory,
                  })
                }
                className="h-11 w-full rounded-xl border border-white/10 bg-[#12131a] px-3 text-sm text-white outline-none focus:border-red-500"
              >
                <option value="intro">Intro đầu tập</option>
                <option value="ad">Quảng cáo giữa phim</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={isSavingAdVideo}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#E50914] px-5 text-sm font-bold text-white transition hover:bg-[#ff1f2d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={16} />
              {isSavingAdVideo ? "Đang lưu..." : "Thêm video"}
            </button>
          </form>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Danh sách video ({adVideos.length})
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Tập đầu phát ngẫu nhiên trong nhóm intro; quảng cáo giữa phim
                  phát ngẫu nhiên trong nhóm quảng cáo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadAdVideos()}
                disabled={isLoadingAdVideos}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
              >
                <RefreshCw
                  size={13}
                  className={isLoadingAdVideos ? "animate-spin" : ""}
                />
                Làm mới
              </button>
            </div>

            {adVideoError && (
              <p
                role="alert"
                className="mx-5 mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300"
              >
                {adVideoError}
              </p>
            )}

            {isLoadingAdVideos ? (
              <p className="px-5 py-10 text-center text-sm text-gray-400">
                Đang tải danh sách video...
              </p>
            ) : adVideos.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-gray-400">
                Chưa có video tùy chỉnh. Intro mặc định sẽ tiếp tục được sử dụng
                cho đến khi bạn thêm video.
              </p>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {adVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"
                  >
                    <span
                      className={`w-fit shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                        video.category === "intro"
                          ? "border-sky-500/20 bg-sky-500/10 text-sky-300"
                          : "border-amber-500/20 bg-amber-500/10 text-amber-300"
                      }`}
                    >
                      {video.category === "intro" ? "Intro" : "Quảng cáo"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">
                        {video.title}
                      </p>
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 flex items-center gap-1 truncate text-xs text-gray-500 transition hover:text-red-300"
                      >
                        <span className="truncate">{video.url}</span>
                        <ExternalLink size={12} className="shrink-0" />
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDeleteAdVideo(video)}
                      className="flex w-fit items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/20"
                    >
                      <Trash2 size={13} />
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 1: OVERVIEW (DỮ LIỆU THỰC) */}
      {activeTab === "overview" && (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Real Total Movies */}
            <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Tổng số phim thực
                </span>
                <Film size={18} className="text-amber-400" />
              </div>
              <div className="text-3xl font-black text-white font-mono">
                {totalMoviesCount > 0
                  ? totalMoviesCount.toLocaleString()
                  : "Đang tải..."}
              </div>
              <div className="text-[11px] text-emerald-400 mt-2 font-bold flex items-center gap-1">
                <span>●</span> Dữ liệu API Ophim trực tuyến
              </div>
            </div>

            {/* Real Registered Members */}
            <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Thành viên đăng ký
                </span>
                <Users size={18} className="text-blue-400" />
              </div>
              <div className="text-3xl font-black text-white font-mono">
                {accounts.length}
              </div>
              <div className="text-[11px] text-emerald-400 mt-2 font-bold">
                Tài khoản khách hàng thực tế
              </div>
            </div>

            {/* Real Watch & Favorites */}
            <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Lượt lưu & Lịch sử
                </span>
                <Bookmark size={18} className="text-[#E50914]" />
              </div>
              <div className="text-3xl font-black text-white font-mono">
                {totalFavoritesCount + totalHistoryCount}
              </div>
              <div className="text-[11px] text-gray-400 mt-2">
                {totalFavoritesCount} đã lưu • {totalHistoryCount} lịch sử xem
              </div>
            </div>

            {/* Real Network Status */}
            <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Độ trễ API máy chủ
                </span>
                <Activity size={18} className="text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {apiLatency !== null ? `${apiLatency} ms` : "Đang kiểm tra..."}
              </div>
              <div className="text-[11px] text-emerald-400 mt-2 font-bold">
                Kết nối mượt mà ổn định
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Sliders size={16} className="text-[#E50914]" />
              Thao tác nhanh
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab("users")}
                className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-all cursor-pointer"
              >
                Quản lý tài khoản khách hàng ({accounts.length}) &rarr;
              </button>
              <button
                onClick={() => setIsAddUserOpen(true)}
                className="px-4 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#ff1f2d] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus size={14} />
                Thêm khách hàng mới
              </button>
              <button
                onClick={() => void loadRealData()}
                className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw
                  size={14}
                  className={isLoadingRealData ? "animate-spin" : ""}
                />
                Làm mới dữ liệu thực
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} />
                Đặt lại danh sách về mặc định
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS (QUẢN LÝ TÀI KHOẢN KHÁCH HÀNG, XEM & ĐỔI MẬT KHẨU, ĐỔI THÔNG TIN) */}
      {activeTab === "users" && (
        <div className="mt-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 max-w-xl">
              <div className="relative flex-1 min-w-[240px]">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Tìm khách hàng theo email hoặc họ tên..."
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-[#12131a] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 outline-none"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Quản trị viên</option>
                <option value="member">Thành viên</option>
                <option value="vip">VIP</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddUserOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#E50914] hover:bg-[#ff1f2d] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Thêm tài khoản</span>
              </button>
            </div>
          </div>

          {/* Customer Accounts Table */}
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.05] text-gray-300 uppercase font-mono tracking-wider border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Khách hàng</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Mật khẩu</th>
                    <th className="p-3.5">Vai trò</th>
                    <th className="p-3.5">Trạng thái</th>
                    <th className="p-3.5">Ngày tạo</th>
                    <th className="p-3.5 text-right">Quản lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredAccounts.map((account) => {
                    const isMaster =
                      account.email === "buitan.khang.189@gmail.com";
                    const isRevealed = revealedPasswords[account.id];

                    return (
                      <tr
                        key={account.id}
                        className="hover:bg-white/[0.03] transition-colors"
                      >
                        {/* Name & Avatar */}
                        <td className="p-3.5 font-bold text-white flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#E50914] to-[#B81D24] text-white font-black text-xs flex items-center justify-center shrink-0 shadow">
                            {account.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-bold">
                              {account.name}
                            </p>
                            <p className="text-[10px] text-gray-400 font-normal">
                              ID: {account.id}
                            </p>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="p-3.5 text-gray-300 font-mono">
                          {account.email}
                        </td>

                        {/* Password: View & Edit button */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-white/80 bg-white/5 px-2 py-1 rounded">
                              {isRevealed ? account.password : "••••••••"}
                            </span>
                            <button
                              onClick={() => toggleRevealPassword(account.id)}
                              className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                              title={
                                isRevealed ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                              }
                            >
                              {isRevealed ? (
                                <EyeOff size={13} />
                              ) : (
                                <Eye size={13} />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setPasswordModalAccount(account);
                                setNewPasswordInput("");
                              }}
                              className="p-1 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                              title="Đổi mật khẩu cho khách này"
                            >
                              <KeyRound size={13} />
                            </button>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              account.role === "admin"
                                ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                : account.role === "vip"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                  : "bg-white/10 text-gray-300"
                            }`}
                          >
                            {account.role}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${
                              account.status === "active"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                account.status === "active"
                                  ? "bg-emerald-400"
                                  : "bg-red-400"
                              }`}
                            />
                            {account.status === "active"
                              ? "Hoạt động"
                              : "Đã khóa"}
                          </span>
                        </td>

                        {/* Date Created */}
                        <td className="p-3.5 text-gray-400">
                          {account.createdAt}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Customer Info */}
                            <button
                              onClick={() => setEditingAccount(account)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                              title="Sửa thông tin khách hàng"
                            >
                              <Edit3 size={13} />
                            </button>

                            {/* Lock / Unlock account */}
                            {!isMaster && (
                              <button
                                onClick={() =>
                                  void handleToggleLockStatus(account)
                                }
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  account.status === "locked"
                                    ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                                    : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                                }`}
                                title={
                                  account.status === "locked"
                                    ? "Mở khóa tài khoản"
                                    : "Khóa tài khoản"
                                }
                              >
                                {account.status === "locked" ? (
                                  <Unlock size={13} />
                                ) : (
                                  <Lock size={13} />
                                )}
                              </button>
                            )}

                            {/* Delete account */}
                            {!isMaster && (
                              <button
                                onClick={() =>
                                  void handleDeleteAccount(account)
                                }
                                className="p-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white transition-colors cursor-pointer"
                                title="Xóa tài khoản khách hàng"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredAccounts.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-8 text-center text-gray-400 italic"
                      >
                        Không tìm thấy tài khoản khách hàng nào khớp với tìm
                        kiếm.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REAL MOVIES */}
      {activeTab === "movies" && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Danh sách phim mới cập nhật từ hệ thống Ophim & PhimAPI
            </p>
            <span className="text-xs font-mono text-red-400 font-bold">
              Hiển thị: {realMovies.length} phim
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.05] text-gray-300 uppercase font-mono tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-3.5">Tên phim</th>
                  <th className="p-3.5">Năm</th>
                  <th className="p-3.5">Chất lượng</th>
                  <th className="p-3.5">Tập mới nhất</th>
                  <th className="p-3.5 text-right">Xem phim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {realMovies.map((movie) => (
                  <tr
                    key={movie._id}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="p-3.5">
                      <div className="font-bold text-white">{movie.name}</div>
                      <div className="text-[10px] text-gray-400 italic">
                        {movie.origin_name}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-gray-300">
                      {movie.year || "2026"}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                        {movie.quality || "HD Vietsub"}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-300">
                      {movie.episode_current || "Hoàn tất"}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/phim/${movie.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white inline-block transition-colors"
                      >
                        <Play size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE */}
      {activeTab === "database" && (
        <div className="mt-8 space-y-6">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Database size={16} className="text-[#E50914]" />
              Dữ liệu & Đồng bộ hệ thống
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
              Hệ thống lưu trữ tài khoản người dùng, danh sách phim yêu thích và
              lịch sử xem trên bộ nhớ phân tán đồng bộ. Bạn có thể làm sạch hoặc
              đặt lại dữ liệu bất cứ lúc nào.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={handleResetData}
                className="px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} />
                Đặt lại toàn bộ dữ liệu về ban đầu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ĐỔI MẬT KHẨU KHÁCH HÀNG (ADMIN CHANGE CUSTOMER PASSWORD) */}
      {passwordModalAccount && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#12131a] p-6 shadow-2xl">
            <button
              onClick={() => setPasswordModalAccount(null)}
              className="absolute right-4 top-4 text-white/50 hover:text-white"
            >
              <X size={18} />
            </button>

            <p className="text-xs font-bold uppercase text-[#FF4D4D] mb-1">
              Quản trị viên
            </p>
            <h3 className="text-xl font-black text-white mb-2">
              Đổi mật khẩu khách hàng
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Tài khoản:{" "}
              <strong className="text-white">
                {passwordModalAccount.email}
              </strong>
            </p>

            <form onSubmit={handleAdminChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Mật khẩu mới cho tài khoản:
                </label>
                <input
                  type="text"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full h-11 rounded-xl bg-white/[0.05] border border-white/10 px-4 text-sm text-white focus:outline-none focus:border-red-500"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalAccount(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-xs font-bold text-gray-300 hover:text-white"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#ff1f2d] text-xs font-bold text-white shadow-lg cursor-pointer"
                >
                  Lưu mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SỬA THÔNG TIN KHÁCH HÀNG (ADMIN EDIT CUSTOMER INFO) */}
      {editingAccount && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-[460px] rounded-2xl border border-white/10 bg-[#12131a] p-6 shadow-2xl">
            <button
              onClick={() => setEditingAccount(null)}
              className="absolute right-4 top-4 text-white/50 hover:text-white"
            >
              <X size={18} />
            </button>

            <p className="text-xs font-bold uppercase text-[#FF4D4D] mb-1">
              Quản trị viên
            </p>
            <h3 className="text-xl font-black text-white mb-4">
              Sửa thông tin khách hàng
            </h3>

            <form onSubmit={handleSaveCustomerInfo} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={editingAccount.name}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      name: e.target.value,
                    })
                  }
                  className="w-full h-11 rounded-xl bg-white/[0.05] border border-white/10 px-4 text-sm text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingAccount.email}
                  disabled={
                    editingAccount.email === "buitan.khang.189@gmail.com"
                  }
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      email: e.target.value,
                    })
                  }
                  className="w-full h-11 rounded-xl bg-white/[0.05] border border-white/10 px-4 text-sm text-white focus:outline-none focus:border-red-500 disabled:opacity-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Vai trò
                  </label>
                  <select
                    value={editingAccount.role}
                    disabled={
                      editingAccount.email === "buitan.khang.189@gmail.com"
                    }
                    onChange={(e) =>
                      setEditingAccount({
                        ...editingAccount,
                        role: e.target.value as "admin" | "member" | "vip",
                      })
                    }
                    className="w-full h-11 rounded-xl bg-[#181924] border border-white/10 px-3 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="member">Thành viên</option>
                    <option value="vip">VIP</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={editingAccount.status}
                    disabled={
                      editingAccount.email === "buitan.khang.189@gmail.com"
                    }
                    onChange={(e) =>
                      setEditingAccount({
                        ...editingAccount,
                        status: e.target.value as "active" | "locked",
                      })
                    }
                    className="w-full h-11 rounded-xl bg-[#181924] border border-white/10 px-3 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="locked">Đã khóa</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-xs font-bold text-gray-300 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#ff1f2d] text-xs font-bold text-white shadow-lg cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: THÊM KHÁCH HÀNG MỚI (ADMIN ADD NEW CUSTOMER) */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-[440px] rounded-2xl border border-white/10 bg-[#12131a] p-6 shadow-2xl">
            <button
              onClick={() => setIsAddUserOpen(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-white"
            >
              <X size={18} />
            </button>

            <p className="text-xs font-bold uppercase text-[#FF4D4D] mb-1">
              Quản trị viên
            </p>
            <h3 className="text-xl font-black text-white mb-4">
              Thêm khách hàng mới
            </h3>

            <form onSubmit={handleCreateNewUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên"
                  value={newUserForm.name}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, name: e.target.value })
                  }
                  className="w-full h-11 rounded-xl bg-white/[0.05] border border-white/10 px-4 text-sm text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={newUserForm.email}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, email: e.target.value })
                  }
                  className="w-full h-11 rounded-xl bg-white/[0.05] border border-white/10 px-4 text-sm text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={newUserForm.password}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, password: e.target.value })
                  }
                  className="w-full h-11 rounded-xl bg-white/[0.05] border border-white/10 px-4 text-sm text-white focus:outline-none focus:border-red-500"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Vai trò
                </label>
                <select
                  value={newUserForm.role}
                  onChange={(e) =>
                    setNewUserForm({
                      ...newUserForm,
                      role: e.target.value as "member" | "vip" | "admin",
                    })
                  }
                  className="w-full h-11 rounded-xl bg-[#181924] border border-white/10 px-3 text-sm text-white focus:outline-none focus:border-red-500"
                >
                  <option value="member">Thành viên thông thường</option>
                  <option value="vip">Thành viên VIP</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-xs font-bold text-gray-300 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#ff1f2d] text-xs font-bold text-white shadow-lg cursor-pointer"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
