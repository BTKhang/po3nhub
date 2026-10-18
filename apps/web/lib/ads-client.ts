export type AdVideoCategory = "intro" | "ad";

export interface ManagedAdVideo {
  id: string;
  title: string;
  url: string;
  category: AdVideoCategory;
  enabled: boolean;
  createdAt: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/backend/ads${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch (error) {
    throw new Error(
      "Không kết nối được API quản lý video. Hãy chạy pnpm dev để khởi động cả web và API, hoặc kiểm tra API_BASE_URL trên hosting.",
      { cause: error },
    );
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || "Không thể quản lý video quảng cáo");
  }

  return (await response.json()) as T;
}

export const adsClient = {
  async list(): Promise<ManagedAdVideo[]> {
    const result = await request<{ items: ManagedAdVideo[] }>("/manage");
    return result.items;
  },

  async create(input: {
    title: string;
    url: string;
    category: AdVideoCategory;
  }): Promise<ManagedAdVideo> {
    const result = await request<{ item: ManagedAdVideo }>("/manage", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return result.item;
  },

  async remove(id: string): Promise<void> {
    await request<{ success: boolean }>(`/manage/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};
