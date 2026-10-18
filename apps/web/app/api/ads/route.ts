import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const introDir = path.join(process.cwd(), "public", "intro");
    const videoExtensions = [".mp4", ".webm", ".mkv", ".mov"];
    const files = fs.existsSync(introDir) ? fs.readdirSync(introDir) : [];
    const videos = files
      .filter((file) =>
        videoExtensions.includes(path.extname(file).toLowerCase()),
      )
      .map((file) => `/intro/${file}`);

    const allVideos =
      videos.length > 0 ? videos : ["/intro/intro-quancao.mp4"];
    const introVideos = allVideos.filter((url) => /intro/i.test(url));

    return NextResponse.json({
      success: true,
      introVideos: introVideos.length > 0 ? introVideos : allVideos,
      adVideos: allVideos,
      preroll: "/intro/intro-quancao.mp4",
      ads: allVideos,
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      introVideos: ["/intro/intro-quancao.mp4"],
      adVideos: ["/intro/intro-quancao.mp4"],
      preroll: "/intro/intro-quancao.mp4",
      ads: ["/intro/intro-quancao.mp4"],
    });
  }
}
