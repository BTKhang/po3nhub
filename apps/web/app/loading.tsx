export default function Loading() {
  return (
    <main className="min-h-screen bg-[#090a0f] text-white flex items-center justify-center fixed inset-0 z-[9999]">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/10 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-t-[#E50914] rounded-full animate-spin absolute top-0 left-0"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-[#E50914] rounded-full animate-pulse shadow-[0_0_10px_#E50914]"></div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <h2 className="text-[#FF4D4D] text-xs font-bold uppercase tracking-widest animate-pulse">
            Đang tải dữ liệu Po3nHub...
          </h2>
          <p className="text-gray-500 text-[11px] font-medium">
            Chuẩn điện ảnh 4K Ultra HD
          </p>
        </div>
      </div>
    </main>
  );
}
