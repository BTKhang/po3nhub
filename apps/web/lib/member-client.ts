"use client";

const RENDER_API_BASE_URL = "https://rophim-server.onrender.com";
const BACKEND_PROXY_BASE_URL = "/api/backend";

export interface MemberUser {
  id: string;
  email: string;
  name: string;
  role?: "admin" | "member" | "vip" | string;
  status?: "active" | "locked";
  createdAt?: string;
}

export interface AccountRecord {
  id: string;
  email: string;
  name: string;
  password: string;
  role: "admin" | "member" | "vip";
  status: "active" | "locked";
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export function isAdminUser(user: MemberUser | null | undefined): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  const email = (user.email || "").toLowerCase().trim();
  return (
    email === "buitan.khang.189@gmail.com" ||
    user.id === "usr_admin_khang"
  );
}

export interface FavoriteItem {
  id: string;
  movieSlug: string;
  movieTitle: string;
  posterUrl?: string;
  createdAt: string;
}

export interface CommentItem {
  id: string;
  movieSlug: string;
  movieTitle: string;
  body: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface WatchHistoryItem {
  id: string;
  movieSlug: string;
  movieTitle: string;
  posterUrl?: string;
  episodeName: string;
  progressSeconds: number;
  updatedAt: string;
}

export interface MoviePayload {
  movieSlug: string;
  movieTitle: string;
  posterUrl?: string;
}

export const memberApiBaseUrl = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost") {
      return configuredUrl?.replace(/\/$/, "") || "http://localhost:3001";
    }

    return BACKEND_PROXY_BASE_URL;
  }

  return configuredUrl?.replace(/\/$/, "") || RENDER_API_BASE_URL;
};

const STORAGE_KEYS = {
  USER: "po3nhub_member_current_user",
  ACCOUNTS: "po3nhub_member_accounts",
  FAVORITES: "po3nhub_member_favorites",
  HISTORY: "po3nhub_member_history",
  COMMENTS: "po3nhub_member_comments",
};

const MASTER_ADMIN_ACCOUNT: AccountRecord = {
  id: "usr_admin_khang",
  email: "buitan.khang.189@gmail.com",
  name: "Bùi Tấn Khang",
  password: "0971642189",
  role: "admin",
  status: "active",
  createdAt: new Date().toLocaleDateString("vi-VN"),
  updatedAt: new Date().toLocaleDateString("vi-VN"),
  lastLogin: "Vừa xong",
};

const getLocalItem = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const setLocalItem = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

function memberStorageKey(key: string): string {
  const user = getLocalItem<MemberUser | null>(STORAGE_KEYS.USER, null);
  const accountKey = user?.email.trim().toLowerCase();
  return accountKey
    ? `${key}:${encodeURIComponent(accountKey)}`
    : `${key}:anonymous`;
}

function getMemberLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  const scopedKey = memberStorageKey(key);
  const scopedValue = localStorage.getItem(scopedKey);
  if (scopedValue !== null) {
    try {
      return JSON.parse(scopedValue) as T;
    } catch {
      return fallback;
    }
  }

  const user = getLocalItem<MemberUser | null>(STORAGE_KEYS.USER, null);
  const legacyValue = user ? localStorage.getItem(key) : null;
  if (legacyValue === null) return fallback;

  try {
    const parsedValue = JSON.parse(legacyValue) as T;
    setLocalItem(scopedKey, parsedValue);
    localStorage.removeItem(key);
    return parsedValue;
  } catch {
    return fallback;
  }
}

function setMemberLocalItem<T>(key: string, value: T): void {
  setLocalItem(memberStorageKey(key), value);
}

function getStoredAccounts(): AccountRecord[] {
  const accounts = getLocalItem<AccountRecord[]>(STORAGE_KEYS.ACCOUNTS, []);
  // Ensure master admin is always present and up-to-date
  const masterIndex = accounts.findIndex(
    (a) => a.email.toLowerCase() === MASTER_ADMIN_ACCOUNT.email.toLowerCase(),
  );
  const masterAcc = accounts[masterIndex];
  if (masterIndex >= 0 && masterAcc) {
    accounts[masterIndex] = {
      ...masterAcc,
      ...MASTER_ADMIN_ACCOUNT,
      lastLogin: masterAcc.lastLogin || MASTER_ADMIN_ACCOUNT.lastLogin,
    };
  } else {
    accounts.unshift(MASTER_ADMIN_ACCOUNT);
    setLocalItem(STORAGE_KEYS.ACCOUNTS, accounts);
  }
  return accounts;
}

function saveStoredAccounts(accounts: AccountRecord[]) {
  setLocalItem(STORAGE_KEYS.ACCOUNTS, accounts);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(`${memberApiBaseUrl()}${path}`, {
      ...init,
      credentials: "include",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(
        payload?.message || "Không thể kết nối tài khoản thành viên",
      );
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const memberClient = {
  async me(): Promise<{ user: MemberUser | null }> {
    try {
      const res = await request<{ user: MemberUser | null }>("/auth/me");
      if (res.user) {
        setLocalItem(STORAGE_KEYS.USER, res.user);
        return res;
      }
    } catch {
      // Fallback
    }
    const localUser = getLocalItem<MemberUser | null>(STORAGE_KEYS.USER, null);
    return { user: localUser };
  },

  async register(input: {
    email: string;
    name: string;
    password: string;
  }): Promise<{ user: MemberUser }> {
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();
    const password = input.password;

    if (!email || !email.includes("@")) {
      throw new Error("Email không đúng định dạng");
    }
    if (!password || password.length < 6) {
      throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
    }

    try {
      const res = await request<{ user: MemberUser }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setLocalItem(STORAGE_KEYS.USER, res.user);
      return res;
    } catch {
      // Local Registration Fallback
      const accounts = getStoredAccounts();
      const existing = accounts.find((a) => a.email.toLowerCase() === email);
      if (existing) {
        throw new Error("Email này đã được đăng ký tài khoản. Vui lòng đăng nhập.");
      }

      const isMasterAdmin = email === "buitan.khang.189@gmail.com";
      const nowStr = new Date().toLocaleDateString("vi-VN");

      const newAccount: AccountRecord = {
        id: isMasterAdmin ? "usr_admin_khang" : `usr_${Date.now().toString(36)}`,
        email,
        name: name || (isMasterAdmin ? "Bùi Tấn Khang" : email.split("@")[0] || "Thành viên"),
        password,
        role: isMasterAdmin ? "admin" : "member",
        status: "active",
        createdAt: nowStr,
        updatedAt: nowStr,
        lastLogin: "Vừa xong",
      };

      accounts.push(newAccount);
      saveStoredAccounts(accounts);

      const memberUser: MemberUser = {
        id: newAccount.id,
        email: newAccount.email,
        name: newAccount.name,
        role: newAccount.role,
        status: newAccount.status,
        createdAt: newAccount.createdAt,
      };

      setLocalItem(STORAGE_KEYS.USER, memberUser);
      return { user: memberUser };
    }
  },

  async login(input: { email: string; password: string }): Promise<{ user: MemberUser }> {
    const email = input.email.trim().toLowerCase();
    const password = input.password;

    try {
      const res = await request<{ user: MemberUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setLocalItem(STORAGE_KEYS.USER, res.user);
      return res;
    } catch {
      // Local Login Fallback
      const accounts = getStoredAccounts();
      const account = accounts.find((a) => a.email.toLowerCase() === email);

      if (!account) {
        throw new Error("Tài khoản không tồn tại. Vui lòng đăng ký tài khoản mới.");
      }

      if (account.status === "locked") {
        throw new Error("Tài khoản của bạn đã bị khóa bởi Quản trị viên.");
      }

      // Check password
      if (account.password !== password) {
        throw new Error("Mật khẩu không chính xác. Vui lòng kiểm tra lại.");
      }

      // Update last login
      account.lastLogin = new Date().toLocaleString("vi-VN");
      saveStoredAccounts(accounts);

      const memberUser: MemberUser = {
        id: account.id,
        email: account.email,
        name: account.name,
        role: account.role,
        status: account.status,
        createdAt: account.createdAt,
      };

      setLocalItem(STORAGE_KEYS.USER, memberUser);
      return { user: memberUser };
    }
  },

  async logout(): Promise<{ ok: true }> {
    try {
      await request<{ ok: true }>("/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    return { ok: true };
  },

  async changePassword(input: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    const currentUser = getLocalItem<MemberUser | null>(STORAGE_KEYS.USER, null);
    if (!currentUser) {
      throw new Error("Vui lòng đăng nhập để đổi mật khẩu");
    }

    if (!input.newPassword || input.newPassword.length < 6) {
      throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
    }

    const accounts = getStoredAccounts();
    const accountIndex = accounts.findIndex(
      (a) => a.email.toLowerCase() === currentUser.email.toLowerCase(),
    );

    const targetAccount = accounts[accountIndex];
    if (accountIndex === -1 || !targetAccount) {
      throw new Error("Không tìm thấy thông tin tài khoản để đổi mật khẩu");
    }

    if (targetAccount.password !== input.currentPassword) {
      throw new Error("Mật khẩu hiện tại không chính xác");
    }

    targetAccount.password = input.newPassword;
    targetAccount.updatedAt = new Date().toLocaleDateString("vi-VN");
    accounts[accountIndex] = targetAccount;
    saveStoredAccounts(accounts);

    return { success: true, message: "Đổi mật khẩu thành công!" };
  },

  // ADMIN ACCOUNT MANAGEMENT METHODS
  async getAllAccounts(): Promise<AccountRecord[]> {
    return getStoredAccounts();
  },

  async adminUpdateAccount(
    accountId: string,
    updates: Partial<AccountRecord>,
  ): Promise<AccountRecord> {
    const accounts = getStoredAccounts();
    const index = accounts.findIndex((a) => a.id === accountId);
    const acc = accounts[index];
    if (index === -1 || !acc) {
      throw new Error("Không tìm thấy tài khoản cần cập nhật");
    }

    // Do not allow changing master admin email or demoting role
    if (acc.email === MASTER_ADMIN_ACCOUNT.email) {
      if (updates.email && updates.email !== MASTER_ADMIN_ACCOUNT.email) {
        throw new Error("Không được thay đổi email của Quản trị viên Master");
      }
      if (updates.role && updates.role !== "admin") {
        throw new Error("Không thể hạ quyền của Quản trị viên Master");
      }
      if (updates.status && updates.status === "locked") {
        throw new Error("Không thể khóa tài khoản Quản trị viên Master");
      }
    }

    const updatedAcc: AccountRecord = {
      ...acc,
      ...updates,
      updatedAt: new Date().toLocaleDateString("vi-VN"),
    };
    accounts[index] = updatedAcc;

    saveStoredAccounts(accounts);

    // If updating currently logged in user, refresh current user in storage
    const currentUser = getLocalItem<MemberUser | null>(STORAGE_KEYS.USER, null);
    if (currentUser && currentUser.id === accountId) {
      setLocalItem(STORAGE_KEYS.USER, {
        ...currentUser,
        name: updatedAcc.name,
        role: updatedAcc.role,
        status: updatedAcc.status,
      });
    }

    return updatedAcc;
  },

  async adminDeleteAccount(accountId: string): Promise<{ success: boolean }> {
    const accounts = getStoredAccounts();
    const target = accounts.find((a) => a.id === accountId);
    if (target?.email === MASTER_ADMIN_ACCOUNT.email) {
      throw new Error("Không được xóa tài khoản Quản trị viên Master!");
    }

    const filtered = accounts.filter((a) => a.id !== accountId);
    saveStoredAccounts(filtered);
    return { success: true };
  },

  async adminCreateAccount(data: {
    name: string;
    email: string;
    password: string;
    role?: "admin" | "member" | "vip";
  }): Promise<AccountRecord> {
    const accounts = getStoredAccounts();
    const email = data.email.trim().toLowerCase();
    if (accounts.some((a) => a.email.toLowerCase() === email)) {
      throw new Error("Email này đã tồn tại trong hệ thống");
    }

    const nowStr = new Date().toLocaleDateString("vi-VN");
    const newAcc: AccountRecord = {
      id: `usr_${Date.now().toString(36)}`,
      name: data.name.trim(),
      email,
      password: data.password,
      role: data.role || "member",
      status: "active",
      createdAt: nowStr,
      updatedAt: nowStr,
      lastLogin: "Chưa đăng nhập",
    };

    accounts.push(newAcc);
    saveStoredAccounts(accounts);
    return newAcc;
  },

  async resetToRealData(): Promise<{ success: boolean; accountsCount: number }> {
    const accounts = [MASTER_ADMIN_ACCOUNT];
    saveStoredAccounts(accounts);
    return { success: true, accountsCount: 1 };
  },

  async toggleFavorite(input: MoviePayload): Promise<{ favorited: boolean }> {
    try {
      const res = await request<{ favorited: boolean }>("/member/favorites/toggle", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return res;
    } catch {
      const list = getMemberLocalItem<FavoriteItem[]>(STORAGE_KEYS.FAVORITES, []);
      const index = list.findIndex((f) => f.movieSlug === input.movieSlug);
      let favorited = false;
      if (index >= 0) {
        list.splice(index, 1);
        favorited = false;
      } else {
        list.unshift({
          id: `fav_${Date.now().toString(36)}`,
          movieSlug: input.movieSlug,
          movieTitle: input.movieTitle,
          posterUrl: input.posterUrl,
          createdAt: new Date().toLocaleDateString("vi-VN"),
        });
        favorited = true;
      }
      setMemberLocalItem(STORAGE_KEYS.FAVORITES, list);
      return { favorited };
    }
  },

  async saveFavorite(input: MoviePayload): Promise<{ favorited: boolean }> {
    try {
      return await request<{ favorited: boolean }>("/member/favorites", {
        method: "POST",
        body: JSON.stringify(input),
      });
    } catch {
      return this.toggleFavorite(input);
    }
  },

  async favorites(): Promise<{ items: FavoriteItem[] }> {
    try {
      return await request<{ items: FavoriteItem[] }>("/member/favorites");
    } catch {
      const items = getMemberLocalItem<FavoriteItem[]>(STORAGE_KEYS.FAVORITES, []);
      return { items };
    }
  },

  async history(): Promise<{ items: WatchHistoryItem[] }> {
    try {
      return await request<{ items: WatchHistoryItem[] }>("/member/history");
    } catch {
      const items = getMemberLocalItem<WatchHistoryItem[]>(STORAGE_KEYS.HISTORY, []);
      return { items };
    }
  },

  async comments(movieSlug: string): Promise<{ items: CommentItem[] }> {
    try {
      return await request<{ items: CommentItem[] }>(
        `/member/comments?movieSlug=${encodeURIComponent(movieSlug)}`,
      );
    } catch {
      const allComments = getMemberLocalItem<CommentItem[]>(STORAGE_KEYS.COMMENTS, []);
      const items = allComments.filter((c) => c.movieSlug === movieSlug);
      return { items };
    }
  },

  async createComment(input: MoviePayload & { body: string }): Promise<{ item: CommentItem }> {
    try {
      return await request<{ item: CommentItem }>("/member/comments", {
        method: "POST",
        body: JSON.stringify(input),
      });
    } catch {
      const currentUser = getLocalItem<MemberUser | null>(STORAGE_KEYS.USER, {
        id: "usr_guest",
        email: "khach@po3nhub.net",
        name: "Thành viên Po3nHub",
      });
      const newComment: CommentItem = {
        id: `cmt_${Date.now().toString(36)}`,
        movieSlug: input.movieSlug,
        movieTitle: input.movieTitle,
        body: input.body,
        createdAt: new Date().toLocaleDateString("vi-VN"),
        user: {
          id: currentUser?.id || "usr_guest",
          name: currentUser?.name || "Thành viên Po3nHub",
        },
      };
      const all = getMemberLocalItem<CommentItem[]>(STORAGE_KEYS.COMMENTS, []);
      all.unshift(newComment);
      setMemberLocalItem(STORAGE_KEYS.COMMENTS, all);
      return { item: newComment };
    }
  },

  async saveHistory(
    input: MoviePayload & { episodeName: string; progressSeconds?: number },
  ): Promise<{ item: unknown }> {
    try {
      return await request<{ item: unknown }>("/member/history", {
        method: "POST",
        body: JSON.stringify(input),
      });
    } catch {
      const list = getMemberLocalItem<WatchHistoryItem[]>(STORAGE_KEYS.HISTORY, []);
      const index = list.findIndex((h) => h.movieSlug === input.movieSlug);
      const item: WatchHistoryItem = {
        id: index >= 0 ? list[index]?.id || `his_${Date.now().toString(36)}` : `his_${Date.now().toString(36)}`,
        movieSlug: input.movieSlug,
        movieTitle: input.movieTitle,
        posterUrl: input.posterUrl,
        episodeName: input.episodeName,
        progressSeconds: input.progressSeconds || 0,
        updatedAt: new Date().toLocaleDateString("vi-VN"),
      };
      if (index >= 0) {
        list.splice(index, 1);
      }
      list.unshift(item);
      setMemberLocalItem(STORAGE_KEYS.HISTORY, list.slice(0, 50));
      return { item };
    }
  },
};
