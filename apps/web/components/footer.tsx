"use client";

import React from "react";
import Link from "next/link";
import { Po3nHubLogo } from "./po3nhub-brand";
import { Globe, Shield, Heart } from "lucide-react";

const FOOTER_COLUMNS = [
  {
    title: "Khám phá",
    links: [
      { name: "Phim Bộ Đang Hot", url: "/danh-sach/phim-bo" },
      { name: "Phim Chiếu Rạp Mới", url: "/danh-sach/phim-le" },
      { name: "Anime & Hoạt Hình", url: "/danh-sach/hoat-hinh" },
      { name: "Phim Mới Cập Nhật", url: "/danh-sach/phim-moi" },
    ],
  },
  {
    title: "Thể loại phổ biến",
    links: [
      { name: "Phim Hành Động", url: "/the-loai/hanh-dong" },
      { name: "Phim Cổ Trang", url: "/the-loai/co-trang" },
      { name: "Phim Tình Cảm", url: "/the-loai/tinh-cam" },
      { name: "Phim Kinh Dị", url: "/the-loai/kinh-di" },
    ],
  },
  {
    title: "Khu vực",
    links: [
      { name: "Phim Hàn Quốc", url: "/quoc-gia/han-quoc" },
      { name: "Phim Trung Quốc", url: "/quoc-gia/trung-quoc" },
      { name: "Phim Âu Mỹ (US-UK)", url: "/quoc-gia/au-my" },
      { name: "Phim Nhật Bản", url: "/quoc-gia/nhat-ban" },
    ],
  },
  {
    title: "Hỗ trợ & Điều khoản",
    links: [
      { name: "Giới thiệu Po3nHub", url: "/gioi-thieu" },
      { name: "Hỏi - Đáp thường gặp", url: "/hoi-dap" },
      { name: "Chính sách bảo mật", url: "/chinh-sach-bao-mat" },
      { name: "Điều khoản sử dụng", url: "/dieu-khoan-su-dung" },
      { name: "Liên hệ quảng cáo", url: "/lien-he" },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="relative bg-[#0c0d12] text-gray-400 pt-16 pb-12 border-t border-white/[0.08] select-none z-20">
      <div className="container mx-auto px-4 sm:px-8 md:px-12">
        {/* Top: Logo & Slogan */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-white/[0.08]">
          <div className="space-y-3">
            <Po3nHubLogo size="lg" />
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl leading-relaxed">
              <strong className="text-white">Po3nHub</strong> — Nền tảng xem phim trực tuyến độ nét cao 4K Ultra HD miễn phí với giao diện điện ảnh cao cấp, hỗ trợ âm thanh sống động và phụ đề Vietsub, Thuyết minh độc quyền.
            </p>
            <p className="text-xs text-gray-500">
              Chủ sở hữu: <span className="font-semibold text-gray-300">Bùi Tấn Khang</span>
              {" · "}
              <a
                href="mailto:buitan.khang.189@gmail.com"
                className="transition-colors hover:text-white"
              >
                Liên hệ
              </a>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-gray-300">
              <Globe size={14} className="text-[#E50914]" />
              <span>Tiếng Việt (Việt Nam)</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-gray-300">
              <Shield size={14} className="text-emerald-400" />
              <span>Bảo mật SSL 256-bit</span>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 py-10">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.url}
                      className="text-xs text-gray-400 hover:text-[#FF4D4D] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom copyright & disclaimers */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>
            © {new Date().getFullYear()} <span className="text-white font-bold">Po3nHub</span>. Tất cả các nội dung được tổng hợp tự động phục vụ mục đích giải trí và trải nghiệm công nghệ.
          </p>
          <div className="flex items-center gap-1 text-gray-500">
            <span>Po3nHub Cinema — Trải nghiệm giải trí trực tuyến đỉnh cao</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
