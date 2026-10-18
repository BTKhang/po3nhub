import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clapperboard,
  Film,
  Heart,
  Mail,
  MonitorPlay,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Giới thiệu Po3nHub",
  description:
    "Tìm hiểu về Po3nHub, nền tảng khám phá và xem phim trực tuyến. Thông tin chủ sở hữu và kênh liên hệ chính thức.",
};

const FEATURES = [
  {
    icon: Film,
    title: "Khám phá phim",
    description:
      "Tìm kiếm phim và khám phá nội dung theo danh mục, thể loại, quốc gia.",
  },
  {
    icon: MonitorPlay,
    title: "Trải nghiệm xem",
    description:
      "Chọn tập phim, máy chủ phát và tiếp tục theo dõi trên trình phát tích hợp.",
  },
  {
    icon: Heart,
    title: "Thư viện cá nhân",
    description:
      "Thành viên có thể lưu phim yêu thích và xem lại lịch sử theo dõi.",
  },
  {
    icon: Sparkles,
    title: "Quyền lợi VIP",
    description:
      "Tài khoản được cấp role VIP có thể xem phim mà không bị quảng cáo làm gián đoạn.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0b0d14] pb-20 pt-28 text-white sm:pt-32">
      <section className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 left-1/2 h-80 w-[min(900px,100vw)] -translate-x-1/2 rounded-full bg-red-600/10 blur-[100px]"
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/[0.08] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-red-300">
              <Clapperboard size={14} />
              Về Po3nHub
            </span>
            <h1 className="mt-7 text-4xl font-black tracking-tight sm:text-6xl">
              Không gian dành cho
              <span className="mt-2 block bg-gradient-to-r from-red-400 via-[#ff7373] to-white bg-clip-text text-transparent">
                người yêu phim
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/60 sm:text-base sm:leading-8">
              Po3nHub là nền tảng khám phá và xem phim trực tuyến, được xây dựng
              với mong muốn mang đến trải nghiệm giải trí trực quan, tiện lợi và
              phù hợp trên nhiều thiết bị.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#E50914] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/40 transition hover:bg-[#ff1f2d]"
            >
              Khám phá phim
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">
            Trải nghiệm Po3nHub
          </p>
          <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">
            Xem phim theo cách của bạn
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/50">
            Từ khám phá nội dung đến quản lý danh sách theo dõi, các tính năng
            được sắp xếp để bạn dễ dàng tìm thấy điều mình muốn xem.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }, index) => (
            <article
              key={title}
              className="group rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-5 transition duration-300 hover:-translate-y-1 hover:border-red-500/30"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition group-hover:bg-red-500/15">
                <Icon size={20} />
              </div>
              <p className="mt-5 text-[10px] font-bold tracking-[0.18em] text-white/30">
                0{index + 1}
              </p>
              <h3 className="mt-1 text-base font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/50">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-white/[0.08] bg-[#11131b] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative p-7 sm:p-10 lg:p-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-red-600/10 blur-[90px]"
            />
            <div className="relative">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-red-400">
                <UserRound size={22} />
              </span>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
                Chủ sở hữu
              </p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Bùi Tấn Khang
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/55">
                Po3nHub được phát triển như một dự án công nghệ giải trí, tập
                trung vào trải nghiệm xem phim và các tiện ích dành cho thành
                viên. Ý kiến đóng góp và câu hỏi của bạn luôn được trân trọng.
              </p>
              <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-white/40">
                <ShieldCheck size={15} className="text-emerald-400" />
                Kênh liên hệ trực tiếp với chủ sở hữu
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.08] bg-white/[0.02] p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
              Liên hệ
            </p>
            <h3 className="mt-2 text-xl font-bold">Kết nối với chúng tôi</h3>
            <p className="mt-2 text-sm leading-6 text-white/50">
              Liên hệ khi cần hỗ trợ, gửi phản hồi hoặc trao đổi về Po3nHub.
            </p>

            <div className="mt-7 space-y-3">
              <a
                href="mailto:buitan.khang.189@gmail.com"
                className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-black/20 p-4 transition hover:border-red-500/30 hover:bg-red-500/[0.04]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                  <Mail size={19} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-white/35">
                    Email
                  </span>
                  <span className="mt-1 block break-all text-sm font-semibold text-white/85 group-hover:text-white">
                    buitan.khang.189@gmail.com
                  </span>
                </span>
                <ArrowRight
                  size={16}
                  className="ml-auto shrink-0 text-white/25 transition group-hover:translate-x-1 group-hover:text-red-400"
                />
              </a>

              <a
                href="tel:+84971642189"
                className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-black/20 p-4 transition hover:border-red-500/30 hover:bg-red-500/[0.04]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Phone size={19} />
                </span>
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-white/35">
                    Điện thoại
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-white/85 group-hover:text-white">
                    0971 642 189
                  </span>
                </span>
                <ArrowRight
                  size={16}
                  className="ml-auto shrink-0 text-white/25 transition group-hover:translate-x-1 group-hover:text-emerald-400"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-6xl px-4 sm:px-8">
        <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 text-xs leading-6 text-white/40">
          Po3nHub là nền tảng phần mềm. Quyền sử dụng và tính sẵn có của nội
          dung phim phụ thuộc vào nguồn cung cấp và dịch vụ bên thứ ba; vui lòng
          liên hệ nếu cần trao đổi về nội dung trên website.
        </p>
      </section>
    </main>
  );
}
