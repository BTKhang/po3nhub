import type { Metadata } from "next";
import React, { ReactNode } from "react";
import Script from "next/script";
import { Be_Vietnam_Pro, Oswald } from "next/font/google";
import "./globals.css";
// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

const oswald = Oswald({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HideDevBadge } from "@/components/hide-dev-badge";
import { ScrollToTop } from "@/components/scroll-to-top";
import { MemberProvider } from "@/components/member-provider";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "Po3nHub - Xem Phim Chuẩn Netflix Đồ Họa 3D Đỉnh Cao",
  description: "Trang web xem phim trực tuyến Po3nHub phong cách Netflix đỉnh cao với hiệu ứng 3D điện ảnh khi lướt web, kho phim khổng lồ 4K Ultra HD Vietsub và Thuyết minh miễn phí.",
  icons: {
    icon: "/images/logo.svg",
    shortcut: "/images/logo.svg",
    apple: "/images/logo.svg",
  },
  verification: {
    google: "1Uk4kBlg_7_euGY9J1Irc0qfh8rwNNNkChREUVxnja8",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body
        className={`${beVietnamPro.variable} ${oswald.variable} antialiased bg-[#0c0d12] text-white font-sans overflow-x-hidden selection:bg-[#E50914] selection:text-white`}
      >
        <NextTopLoader color="#E50914" showSpinner={false} height={3} />
        <HideDevBadge />
        <MemberProvider>
          <Navbar />

          {/* Main App Content */}
          <div className="relative z-10">{children}</div>

          {/* Scroll to Top helper */}
          <ScrollToTop />

          {/* Footer */}
          <Footer />
        </MemberProvider>
      </body>
    </html>
  );
}
