import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetUsers() {
  console.log("🔄 Bắt đầu dọn dẹp và reset toàn bộ dữ liệu người dùng...");

  try {
    // Xóa theo thứ tự quan hệ khóa ngoại
    const deletedHistory = await prisma.watchHistory.deleteMany();
    console.log(`✓ Đã xóa ${deletedHistory.count} bản ghi lịch sử xem`);

    const deletedRatings = await prisma.rating.deleteMany();
    console.log(`✓ Đã xóa ${deletedRatings.count} đánh giá sao`);

    const deletedComments = await prisma.comment.deleteMany();
    console.log(`✓ Đã xóa ${deletedComments.count} bình luận`);

    const deletedFavorites = await prisma.favorite.deleteMany();
    console.log(`✓ Đã xóa ${deletedFavorites.count} phim yêu thích`);

    const deletedSessions = await prisma.session.deleteMany();
    console.log(`✓ Đã xóa ${deletedSessions.count} phiên đăng nhập (sessions)`);

    const deletedUsers = await prisma.user.deleteMany();
    console.log(`✓ Đã xóa ${deletedUsers.count} tài khoản người dùng`);

    console.log("✅ ĐÃ RESET TOÀN BỘ DỮ LIỆU NGƯỜI DÙNG THÀNH CÔNG!");
  } catch (error) {
    console.error("❌ Lỗi khi reset dữ liệu người dùng:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetUsers();

