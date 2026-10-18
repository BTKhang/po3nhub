"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Lên đầu trang"
      className={`fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[#181924]/90 hover:bg-[#E50914] text-white/80 hover:text-white border border-white/10 flex items-center justify-center shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
      }`}
    >
      <ArrowUp size={18} />
    </button>
  );
};
