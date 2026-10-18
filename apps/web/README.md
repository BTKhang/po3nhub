# Po3nHub Web

Ứng dụng giao diện Next.js của Po3nHub. Xem hướng dẫn cài đặt, chạy API, cấu hình database và triển khai tại [README ở thư mục gốc](../../README.md).

## Phát triển local

Từ thư mục gốc monorepo, cấu hình `DATABASE_URL` trong `.env` rồi chạy cả frontend và backend:

```powershell
pnpm dev
```

Web chạy tại `http://localhost:3000`, NestJS API chạy tại `http://localhost:3001`.

Chỉ chạy riêng frontend khi API đã được bật riêng hoặc `API_BASE_URL` đã trỏ đến một API đang hoạt động:

```powershell
pnpm --filter @po3nhub/web dev
```

Nếu API không hoạt động, proxy trả lỗi `502` và tính năng thành viên/quản lý video không thể lưu hoặc tải dữ liệu.
