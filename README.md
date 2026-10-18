# Po3nHub

Po3nHub là ứng dụng xem phim trực tuyến được xây dựng theo kiến trúc monorepo. Dự án gồm giao diện Next.js, API NestJS và lớp dữ liệu PostgreSQL sử dụng Prisma. Nội dung phim được lấy từ Ophim API.

## Tính năng

- Duyệt, tìm kiếm và lọc phim theo danh mục, thể loại và quốc gia.
- Xem thông tin phim, chọn máy chủ và tập phim.
- Tài khoản thành viên với các chức năng đăng nhập, đăng ký và quản lý hồ sơ.
- Thành viên có role `vip` xem phim không có quảng cáo mở đầu hoặc quảng cáo giữa phim. Quản trị viên có thể cấp role này trong trang quản trị.
- Lưu phim yêu thích, lịch sử xem và bình luận.
- Trang quản trị thành viên và nội dung.
- Quảng cáo mở đầu và quảng cáo giữa phim trên trình phát được hỗ trợ.
- Quản trị viên có thể quản lý URL video intro và quảng cáo; hệ thống chọn video ngẫu nhiên trong từng nhóm.
- Giới hạn xem tập: khách chưa đăng nhập được xem tập đầu tiên; các tập tiếp theo yêu cầu đăng ký hoặc đăng nhập. Khi tập kết thúc, Po3nHub mở biểu mẫu đăng ký và tiếp tục đến tập kế tiếp sau khi xác thực thành công.

> Quy tắc giới hạn tập hiện được áp dụng tại giao diện web. Để bảo vệ luồng video khỏi việc truy cập trực tiếp bằng URL, cần triển khai thêm xác thực và phân quyền ở dịch vụ phân phối video.

## Công nghệ

| Thành phần    | Công nghệ                                      |
| ------------- | ---------------------------------------------- |
| Web           | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Trình phát    | Artplayer, hls.js                              |
| API           | NestJS 11                                      |
| Cơ sở dữ liệu | PostgreSQL, Prisma                             |
| Monorepo      | pnpm workspaces, Turborepo                     |

## Yêu cầu

- Node.js `>=20.9.0` (khuyến nghị Node.js 22).
- Corepack và pnpm `9.0.0`.
- PostgreSQL nếu chạy API và sử dụng dữ liệu tài khoản lưu trên máy chủ.

## Cài đặt

Từ thư mục gốc của dự án:

```powershell
corepack enable
corepack prepare pnpm@9.0.0 --activate
pnpm install
```

Tạo file `.env` trong thư mục gốc khi chạy backend. Lệnh phát triển của API đọc file này qua Node.js `--env-file`:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
```

Thay các giá trị kết nối bằng thông tin PostgreSQL của môi trường đang sử dụng. Không đưa file `.env` hoặc thông tin xác thực vào Git.

## Chạy ứng dụng

### Chạy web và API (khuyến nghị)

API cần được chạy để đăng nhập, quản lý video quảng cáo và lưu dữ liệu thành viên. Đặt file `.env` ở thư mục gốc với `DATABASE_URL`, sau đó chạy cả web và API bằng Turbo:

```powershell
pnpm dev
```

Lệnh này chạy web tại [http://localhost:3000](http://localhost:3000) và API tại `http://localhost:3001`.

Nếu chỉ khởi động web bằng `pnpm --filter @po3nhub/web dev`, API ở `localhost:3001` sẽ không tự chạy. Đây là nguyên nhân gây lỗi `ECONNREFUSED` khi thao tác trong `/admin`.

### Chỉ chạy giao diện web

Chỉ dùng lựa chọn này nếu API đã được chạy riêng ở `http://localhost:3001` hoặc đã khai báo biến môi trường `API_BASE_URL`.

```powershell
pnpm --filter @po3nhub/web dev
```

Mở [http://localhost:3000](http://localhost:3000). Nếu API không chạy, thao tác quản lý video, đăng nhập và các chức năng cần backend sẽ không hoạt động.

### Chạy API

Đảm bảo `DATABASE_URL` đã được cấu hình, sau đó áp dụng migration và chạy API:

```powershell
pnpm --filter @rophim/database migrate:deploy
pnpm --filter @rophim/database build
pnpm --filter @rophim/server dev
```

### Chạy các ứng dụng trong workspace

```powershell
pnpm dev
```

Lệnh này chạy các tác vụ phát triển được khai báo trong workspace. Để sử dụng đầy đủ chức năng thành viên, hãy cấu hình PostgreSQL và API trước.

## Cơ sở dữ liệu

Sau khi cấu hình `DATABASE_URL`, áp dụng migration và tạo Prisma Client bằng:

```powershell
pnpm --filter @rophim/database migrate:deploy
pnpm --filter @rophim/database build
```

> `pnpm db:reset-users` xóa toàn bộ tài khoản, phiên đăng nhập, phim yêu thích, lịch sử xem, bình luận và đánh giá trong cơ sở dữ liệu. Chỉ chạy lệnh này khi chủ động muốn xóa dữ liệu; hãy sao lưu database trước khi thực hiện.

## Cấu hình

| Biến môi trường            | Phạm vi        | Mô tả                                                                                                                                                                                                                     |
| -------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`             | Database, API  | Chuỗi kết nối PostgreSQL được Prisma sử dụng.                                                                                                                                                                             |
| `API_BASE_URL`             | Web, API proxy | URL server-side của API NestJS, ví dụ `https://rophim-server.onrender.com`. Cần cấu hình biến này ở hosting web khi dùng API khác URL mặc định.                                                                           |
| `NEXT_PUBLIC_API_BASE_URL` | Web            | URL API tùy chọn cho các lời gọi từ trình duyệt. Khi chạy trên `localhost`, web mặc định gọi API tại `http://localhost:3001`; ở môi trường triển khai, nên để các request thành viên đi qua proxy backend `/api/backend`. |
| `CORS_ORIGIN`              | API            | Danh sách origin được phép gọi API, theo cấu hình CORS của server.                                                                                                                                                        |
| `PORT`                     | API            | Cổng HTTP của server nếu môi trường triển khai có cấu hình biến này.                                                                                                                                                      |

## Triển khai web và API

Backend và database được cấu hình trong `render.yaml`. Khi triển khai API, Render chạy migration Prisma và build Prisma Client/API. Tài khoản dịch vụ cần có `DATABASE_URL`; cấu hình triển khai hiện tự động chạy khi có commit mới.

Khi deploy web lên Vercel hoặc hosting khác, khai báo `API_BASE_URL` trỏ đến URL công khai của API NestJS (ví dụ `https://rophim-server.onrender.com`), sau đó deploy lại web. Không để `API_BASE_URL` trỏ đến `localhost` trên hosting.

Tài khoản quản trị phải đăng ký hoặc đăng nhập qua API đang hoạt động để tạo session phía server; tài khoản admin lưu riêng trong `localStorage` không đủ quyền gọi API quản lý video. Đảm bảo email quản trị `buitan.khang.189@gmail.com` tồn tại trong database backend.

Sau khi cả web và API đã deploy:

1. Kiểm tra API: mở `https://<API_HOST>/health`, cần nhận JSON có `"status":"ok"`.
2. Kiểm tra danh sách quảng cáo công khai: mở `https://<API_HOST>/ads`.
3. Đăng nhập tài khoản quản trị trên web, mở `/admin` → **Video quảng cáo**.
4. Thêm URL HTTP/HTTPS trỏ trực tiếp tới file video MP4/WebM. URL trang YouTube hoặc link chia sẻ Google Drive không phải URL video trực tiếp.

Danh sách video được lưu trong PostgreSQL và sử dụng chung cho người xem. Migration `20261018120000_ad_video_management` được chạy trong bước build/deploy backend. Intro và quảng cáo giữa phim được chọn ngẫu nhiên trong từng nhóm riêng.

## Kiểm tra chất lượng

Chạy các lệnh sau từ thư mục gốc:

```powershell
pnpm lint
pnpm check-types
pnpm test
pnpm build
```

Có thể kiểm tra định dạng README và các tệp được cấu hình bằng:

```powershell
pnpm format:check
```

## Tài khoản và dữ liệu thành viên

- Khi API và cơ sở dữ liệu hoạt động, dữ liệu thành viên được xử lý qua API và lưu trên máy chủ.
- Nếu API không khả dụng, web hiện hỗ trợ lưu dự phòng một số dữ liệu thành viên trong `localStorage`. Dữ liệu dự phòng yêu thích, lịch sử xem và bình luận được phân tách theo email tài khoản trên cùng trình duyệt; chúng không đồng bộ giữa thiết bị.
- Không sử dụng cơ chế lưu dự phòng trên trình duyệt như một giải pháp xác thực hoặc lưu trữ an toàn cho môi trường production.

## Cấu trúc thư mục

```text
.
├── apps/
│   ├── server/       # API NestJS
│   └── web/          # Ứng dụng Next.js
├── packages/
│   ├── database/     # Prisma schema, migrations và tác vụ dữ liệu
│   ├── eslint-config/
│   ├── typescript-config/
│   └── ui/           # Component dùng chung
├── intro/            # Tài nguyên video mở đầu
├── scripts/          # Script hỗ trợ dự án
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Triển khai

Tệp `render.yaml` mô tả dịch vụ API và PostgreSQL trên Render. Trước khi triển khai, hãy kiểm tra nhánh và cấu hình môi trường, cung cấp `DATABASE_URL` hợp lệ, sau đó chạy migration và build theo lệnh trong cấu hình dịch vụ.

## Bản quyền và nội dung

Po3nHub là phần mềm ứng dụng. Người triển khai chịu trách nhiệm bảo đảm quyền sử dụng đối với nội dung video, hình ảnh, quảng cáo và các dịch vụ bên thứ ba được tích hợp.
"# Po3nHub" 
