import { NextRequest, NextResponse } from "next/server";
import {
  getDbPool,
  ensureMasterAdmin,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  MASTER_ADMIN,
} from "@/lib/server-db";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

// Helper to get authenticated user from request cookie
async function getAuthUser(request: NextRequest) {
  const token =
    request.cookies.get("po3nhub_session")?.value ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  const payload = verifyToken(token);
  if (!payload) return null;

  const pool = getDbPool();
  const res = await pool.query(
    `SELECT id, email, name, role, status, "createdAt" FROM "User" WHERE id = $1 LIMIT 1`,
    [payload.id]
  );
  if (res.rows.length === 0) return null;
  const user = res.rows[0];
  if (user.status === "locked") return null;
  return user;
}

export async function handleBackend(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const subPath = path.join("/").toLowerCase();
  const method = request.method.toUpperCase();

  await ensureMasterAdmin();
  const pool = getDbPool();

  try {
    // -------------------------------------------------------------
    // 1. AUTH: REGISTER
    // -------------------------------------------------------------
    if (subPath === "auth/register" && method === "POST") {
      const body = await request.json();
      const email = (body.email || "").trim().toLowerCase();
      const name = (body.name || "").trim() || email.split("@")[0] || "Thành viên";
      const password = body.password || "";

      if (!email || !email.includes("@")) {
        return NextResponse.json({ message: "Email không đúng định dạng" }, { status: 400 });
      }
      if (!password || password.length < 6) {
        return NextResponse.json({ message: "Mật khẩu phải có ít nhất 6 ký tự" }, { status: 400 });
      }

      const existing = await pool.query(
        `SELECT id FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1`,
        [email]
      );
      if (existing.rows.length > 0) {
        return NextResponse.json(
          { message: "Email này đã được đăng ký tài khoản. Vui lòng đăng nhập." },
          { status: 400 }
        );
      }

      const isMasterAdmin = email === MASTER_ADMIN.email.toLowerCase();
      const userId = isMasterAdmin ? MASTER_ADMIN.id : `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const role = isMasterAdmin ? "admin" : "member";
      const status = "active";
      const passwordHash = hashPassword(password);
      const now = new Date();

      await pool.query(
        `INSERT INTO "User" (id, email, name, "passwordHash", role, status, "lastLogin", "plainPassword", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, 'Vừa xong', $7, $8, $8)`,
        [userId, email, name, passwordHash, role, status, password, now]
      );

      const user = {
        id: userId,
        email,
        name,
        role,
        status,
        createdAt: now.toLocaleDateString("vi-VN"),
      };

      const token = generateToken({ id: userId, email });
      const response = NextResponse.json({ user });
      response.cookies.set("po3nhub_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      return response;
    }

    // -------------------------------------------------------------
    // 2. AUTH: LOGIN
    // -------------------------------------------------------------
    if (subPath === "auth/login" && method === "POST") {
      const body = await request.json();
      const email = (body.email || "").trim().toLowerCase();
      const password = body.password || "";

      if (!email || !password) {
        return NextResponse.json({ message: "Vui lòng nhập email và mật khẩu" }, { status: 400 });
      }

      const res = await pool.query(
        `SELECT id, email, name, "passwordHash", "plainPassword", role, status, "createdAt"
         FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1`,
        [email]
      );

      if (res.rows.length === 0) {
        return NextResponse.json(
          { message: "Tài khoản không tồn tại. Vui lòng đăng ký tài khoản mới." },
          { status: 404 }
        );
      }

      const row = res.rows[0];
      if (row.status === "locked") {
        return NextResponse.json(
          { message: "Tài khoản của bạn đã bị khóa bởi Quản trị viên." },
          { status: 403 }
        );
      }

      const isPasswordValid =
        verifyPassword(password, row.passwordHash) ||
        row.plainPassword === password ||
        (email === MASTER_ADMIN.email.toLowerCase() && password === MASTER_ADMIN.password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { message: "Mật khẩu không chính xác. Vui lòng kiểm tra lại." },
          { status: 400 }
        );
      }

      // Update lastLogin
      const lastLoginStr = new Date().toLocaleString("vi-VN");
      await pool.query(
        `UPDATE "User" SET "lastLogin" = $1, "updatedAt" = NOW() WHERE id = $2`,
        [lastLoginStr, row.id]
      );

      const user = {
        id: row.id,
        email: row.email,
        name: row.name,
        role: row.role || "member",
        status: row.status || "active",
        createdAt: new Date(row.createdAt).toLocaleDateString("vi-VN"),
      };

      const token = generateToken({ id: row.id, email: row.email });
      const response = NextResponse.json({ user });
      response.cookies.set("po3nhub_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      return response;
    }

    // -------------------------------------------------------------
    // 3. AUTH: ME
    // -------------------------------------------------------------
    if (subPath === "auth/me" && method === "GET") {
      const user = await getAuthUser(request);
      if (!user) {
        return NextResponse.json({ user: null });
      }
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || "member",
          status: user.status || "active",
          createdAt: new Date(user.createdAt).toLocaleDateString("vi-VN"),
        },
      });
    }

    // -------------------------------------------------------------
    // 4. AUTH: LOGOUT
    // -------------------------------------------------------------
    if (subPath === "auth/logout" && method === "POST") {
      const response = NextResponse.json({ ok: true });
      response.cookies.delete("po3nhub_session");
      return response;
    }

    // -------------------------------------------------------------
    // 5. AUTH: CHANGE PASSWORD
    // -------------------------------------------------------------
    if (subPath === "auth/change-password" && method === "POST") {
      const body = await request.json();
      const user = await getAuthUser(request);
      const email = (body.email || user?.email || "").trim().toLowerCase();

      if (!email) {
        return NextResponse.json({ message: "Vui lòng đăng nhập để đổi mật khẩu" }, { status: 401 });
      }
      if (!body.newPassword || body.newPassword.length < 6) {
        return NextResponse.json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" }, { status: 400 });
      }

      const res = await pool.query(
        `SELECT id, "passwordHash", "plainPassword" FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1`,
        [email]
      );
      if (res.rows.length === 0) {
        return NextResponse.json({ message: "Không tìm thấy thông tin tài khoản" }, { status: 404 });
      }

      const row = res.rows[0];
      const isCurrentValid =
        verifyPassword(body.currentPassword, row.passwordHash) ||
        row.plainPassword === body.currentPassword;

      if (!isCurrentValid) {
        return NextResponse.json({ message: "Mật khẩu hiện tại không chính xác" }, { status: 400 });
      }

      const newHash = hashPassword(body.newPassword);
      await pool.query(
        `UPDATE "User" SET "passwordHash" = $1, "plainPassword" = $2, "updatedAt" = NOW() WHERE id = $3`,
        [newHash, body.newPassword, row.id]
      );

      return NextResponse.json({ success: true, message: "Đổi mật khẩu thành công!" });
    }

    // -------------------------------------------------------------
    // 6. ADMIN: GET / POST / PATCH / DELETE ACCOUNTS
    // -------------------------------------------------------------
    if (subPath === "admin/accounts") {
      if (method === "GET") {
        const res = await pool.query(
          `SELECT id, email, name, "plainPassword", role, status, "createdAt", "updatedAt", "lastLogin"
           FROM "User" ORDER BY "createdAt" ASC`
        );

        const accounts = res.rows.map((r) => ({
          id: r.id,
          email: r.email,
          name: r.name,
          password: r.plainPassword || (r.email === MASTER_ADMIN.email ? MASTER_ADMIN.password : "••••••••"),
          role: r.role || "member",
          status: r.status || "active",
          createdAt: new Date(r.createdAt).toLocaleDateString("vi-VN"),
          updatedAt: new Date(r.updatedAt).toLocaleDateString("vi-VN"),
          lastLogin: r.lastLogin || "Chưa đăng nhập",
        }));

        return NextResponse.json(accounts);
      }

      if (method === "POST") {
        const body = await request.json();
        const email = (body.email || "").trim().toLowerCase();
        const name = (body.name || "").trim();
        const password = body.password || "";
        const role = body.role || "member";

        if (!email || !password || !name) {
          return NextResponse.json({ message: "Thiếu thông tin tài khoản" }, { status: 400 });
        }

        const existing = await pool.query(
          `SELECT id FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1`,
          [email]
        );
        if (existing.rows.length > 0) {
          return NextResponse.json({ message: "Email này đã tồn tại trong hệ thống" }, { status: 400 });
        }

        const id = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
        const hash = hashPassword(password);
        const now = new Date();

        await pool.query(
          `INSERT INTO "User" (id, email, name, "passwordHash", role, status, "lastLogin", "plainPassword", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, 'active', 'Chưa đăng nhập', $6, $7, $7)`,
          [id, email, name, hash, role, password, now]
        );

        return NextResponse.json({
          id,
          email,
          name,
          password,
          role,
          status: "active",
          createdAt: now.toLocaleDateString("vi-VN"),
          updatedAt: now.toLocaleDateString("vi-VN"),
          lastLogin: "Chưa đăng nhập",
        });
      }

      if (method === "PATCH") {
        const body = await request.json();
        const { id, updates } = body;
        if (!id) {
          return NextResponse.json({ message: "Thiếu ID tài khoản" }, { status: 400 });
        }

        const existing = await pool.query(`SELECT * FROM "User" WHERE id = $1 LIMIT 1`, [id]);
        if (existing.rows.length === 0) {
          return NextResponse.json({ message: "Không tìm thấy tài khoản" }, { status: 404 });
        }
        const acc = existing.rows[0];

        // Guard master admin
        if (acc.email.toLowerCase() === MASTER_ADMIN.email.toLowerCase()) {
          if (updates.email && updates.email.toLowerCase() !== MASTER_ADMIN.email.toLowerCase()) {
            return NextResponse.json({ message: "Không được đổi email của Quản trị viên Master" }, { status: 400 });
          }
          if (updates.role && updates.role !== "admin") {
            return NextResponse.json({ message: "Không thể hạ quyền của Quản trị viên Master" }, { status: 400 });
          }
          if (updates.status && updates.status === "locked") {
            return NextResponse.json({ message: "Không thể khóa tài khoản Quản trị viên Master" }, { status: 400 });
          }
        }

        const newName = updates.name !== undefined ? updates.name : acc.name;
        const newEmail = updates.email !== undefined ? updates.email.toLowerCase().trim() : acc.email;
        const newRole = updates.role !== undefined ? updates.role : acc.role;
        const newStatus = updates.status !== undefined ? updates.status : acc.status;
        let newPasswordHash = acc.passwordHash;
        let newPlainPassword = acc.plainPassword;

        if (updates.password && updates.password.length >= 6) {
          newPasswordHash = hashPassword(updates.password);
          newPlainPassword = updates.password;
        }

        await pool.query(
          `UPDATE "User" SET name = $1, email = $2, role = $3, status = $4, "passwordHash" = $5, "plainPassword" = $6, "updatedAt" = NOW()
           WHERE id = $7`,
          [newName, newEmail, newRole, newStatus, newPasswordHash, newPlainPassword, id]
        );

        return NextResponse.json({
          id,
          email: newEmail,
          name: newName,
          password: newPlainPassword || updates.password || "••••••••",
          role: newRole,
          status: newStatus,
          createdAt: new Date(acc.createdAt).toLocaleDateString("vi-VN"),
          updatedAt: new Date().toLocaleDateString("vi-VN"),
          lastLogin: acc.lastLogin || "Chưa đăng nhập",
        });
      }

      if (method === "DELETE") {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) {
          return NextResponse.json({ message: "Thiếu ID tài khoản" }, { status: 400 });
        }

        const existing = await pool.query(`SELECT email FROM "User" WHERE id = $1 LIMIT 1`, [id]);
        if (existing.rows.length === 0) {
          return NextResponse.json({ success: true });
        }

        if (existing.rows[0].email.toLowerCase() === MASTER_ADMIN.email.toLowerCase()) {
          return NextResponse.json({ message: "Không được xóa tài khoản Quản trị viên Master!" }, { status: 400 });
        }

        await pool.query(`DELETE FROM "User" WHERE id = $1`, [id]);
        return NextResponse.json({ success: true });
      }
    }

    // -------------------------------------------------------------
    // 7. ADMIN: RESET TO REAL DATA
    // -------------------------------------------------------------
    if (subPath === "admin/reset" && method === "POST") {
      await pool.query(
        `DELETE FROM "User" WHERE LOWER(email) != LOWER($1)`,
        [MASTER_ADMIN.email]
      );
      await ensureMasterAdmin();
      return NextResponse.json({ success: true, accountsCount: 1 });
    }

    // -------------------------------------------------------------
    // 8. ADS MANAGEMENT
    // -------------------------------------------------------------
    if (subPath.startsWith("ads/manage")) {
      if (method === "GET") {
        const res = await pool.query(
          `SELECT id, title, url, category, enabled, "createdAt" FROM "AdVideo" WHERE enabled = true ORDER BY "createdAt" DESC`
        );
        return NextResponse.json({ items: res.rows });
      }

      if (method === "POST") {
        const body = await request.json();
        const id = `adv_${Date.now().toString(36)}`;
        await pool.query(
          `INSERT INTO "AdVideo" (id, title, url, category, enabled, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, true, NOW(), NOW())`,
          [id, body.title, body.url, body.category || "ad"]
        );
        return NextResponse.json({
          item: { id, title: body.title, url: body.url, category: body.category || "ad", enabled: true },
        });
      }

      if (method === "DELETE") {
        const parts = subPath.split("/");
        const id = decodeURIComponent(parts[2] || "");
        if (id) {
          await pool.query(`DELETE FROM "AdVideo" WHERE id = $1`, [id]);
        }
        return NextResponse.json({ success: true });
      }
    }

    // -------------------------------------------------------------
    // 9. MEMBER: FAVORITES
    // -------------------------------------------------------------
    if (subPath.startsWith("member/favorites")) {
      const user = await getAuthUser(request);
      const userId = user?.id || "usr_guest";

      if (method === "GET") {
        if (!user) return NextResponse.json({ items: [] });
        const res = await pool.query(
          `SELECT id, "movieSlug", "movieTitle", "posterUrl", "createdAt" FROM "Favorite" WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
          [userId]
        );
        return NextResponse.json({ items: res.rows });
      }

      if (method === "POST") {
        const body = await request.json();
        if (!user) return NextResponse.json({ favorited: true });

        const existing = await pool.query(
          `SELECT id FROM "Favorite" WHERE "userId" = $1 AND "movieSlug" = $2 LIMIT 1`,
          [userId, body.movieSlug]
        );

        if (existing.rows.length > 0) {
          await pool.query(`DELETE FROM "Favorite" WHERE id = $1`, [existing.rows[0].id]);
          return NextResponse.json({ favorited: false });
        } else {
          const id = `fav_${Date.now().toString(36)}`;
          await pool.query(
            `INSERT INTO "Favorite" (id, "userId", "movieSlug", "movieTitle", "posterUrl", "createdAt")
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [id, userId, body.movieSlug, body.movieTitle, body.posterUrl]
          );
          return NextResponse.json({ favorited: true });
        }
      }
    }

    // -------------------------------------------------------------
    // 10. MEMBER: HISTORY
    // -------------------------------------------------------------
    if (subPath.startsWith("member/history")) {
      const user = await getAuthUser(request);
      const userId = user?.id || "usr_guest";

      if (method === "GET") {
        if (!user) return NextResponse.json({ items: [] });
        const res = await pool.query(
          `SELECT id, "movieSlug", "movieTitle", "posterUrl", "episodeName", "progressSeconds", "updatedAt"
           FROM "WatchHistory" WHERE "userId" = $1 ORDER BY "updatedAt" DESC LIMIT 50`,
          [userId]
        );
        return NextResponse.json({ items: res.rows });
      }

      if (method === "POST") {
        const body = await request.json();
        if (!user) return NextResponse.json({ item: body });

        const id = `his_${Date.now().toString(36)}`;
        await pool.query(
          `INSERT INTO "WatchHistory" (id, "userId", "movieSlug", "movieTitle", "posterUrl", "episodeName", "progressSeconds", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
           ON CONFLICT ("userId", "movieSlug", "episodeName")
           DO UPDATE SET "progressSeconds" = EXCLUDED."progressSeconds", "updatedAt" = NOW()`,
          [id, userId, body.movieSlug, body.movieTitle, body.posterUrl, body.episodeName || "", body.progressSeconds || 0]
        );
        return NextResponse.json({ item: body });
      }
    }

    // -------------------------------------------------------------
    // 11. MEMBER: COMMENTS
    // -------------------------------------------------------------
    if (subPath.startsWith("member/comments")) {
      const user = await getAuthUser(request);

      if (method === "GET") {
        const { searchParams } = new URL(request.url);
        const movieSlug = searchParams.get("movieSlug") || "";
        const res = await pool.query(
          `SELECT c.id, c."movieSlug", c."movieTitle", c.body, c."createdAt", u.id as "userId", u.name as "userName"
           FROM "Comment" c
           JOIN "User" u ON c."userId" = u.id
           WHERE c."movieSlug" = $1
           ORDER BY c."createdAt" DESC LIMIT 100`,
          [movieSlug]
        );

        const items = res.rows.map((r) => ({
          id: r.id,
          movieSlug: r.movieSlug,
          movieTitle: r.movieTitle,
          body: r.body,
          createdAt: new Date(r.createdAt).toLocaleDateString("vi-VN"),
          user: { id: r.userId, name: r.userName },
        }));
        return NextResponse.json({ items });
      }

      if (method === "POST") {
        const body = await request.json();
        const userId = user?.id || MASTER_ADMIN.id;
        const id = `cmt_${Date.now().toString(36)}`;
        const now = new Date();

        await pool.query(
          `INSERT INTO "Comment" (id, "userId", "movieSlug", "movieTitle", body, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $6)`,
          [id, userId, body.movieSlug, body.movieTitle, body.body, now]
        );

        return NextResponse.json({
          item: {
            id,
            movieSlug: body.movieSlug,
            movieTitle: body.movieTitle,
            body: body.body,
            createdAt: now.toLocaleDateString("vi-VN"),
            user: { id: userId, name: user?.name || "Thành viên Po3nHub" },
          },
        });
      }
    }

    return NextResponse.json({ ok: false, message: `Route /api/backend/${subPath} không hỗ trợ` }, { status: 404 });
  } catch (error) {
    console.error(`Error in /api/backend/${subPath}:`, error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Lỗi xử lý yêu cầu hệ thống" },
      { status: 500 }
    );
  }
}

export const GET = handleBackend;
export const POST = handleBackend;
export const PUT = handleBackend;
export const PATCH = handleBackend;
export const DELETE = handleBackend;
export const OPTIONS = handleBackend;
