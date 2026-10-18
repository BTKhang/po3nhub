import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const API_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://rophim-server.onrender.com");

function getLocalFallback() {
  const introDir = path.join(process.cwd(), "public", "intro");
  const videoExtensions = [".mp4", ".webm", ".mkv", ".mov"];
  const files = fs.existsSync(introDir) ? fs.readdirSync(introDir) : [];
  const videos = files
    .filter((file) =>
      videoExtensions.includes(path.extname(file).toLowerCase()),
    )
    .map((file) => `/intro/${file}`);
  const introVideos = videos.filter((url) => /intro/i.test(url));
  const adVideos = videos.filter((url) => !/intro/i.test(url));

  return {
    success: true,
    introVideos:
      introVideos.length > 0 ? introVideos : ["/intro/intro-quancao.mp4"],
    adVideos: adVideos.length > 0 ? adVideos : videos,
  };
}

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/ads`, {
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      throw new Error(`Ads API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data.introVideos) || !Array.isArray(data.adVideos)) {
      throw new Error("Ads API returned an invalid video list");
    }

    const fallback = getLocalFallback();
    return NextResponse.json({
      success: true,
      introVideos:
        data.introVideos.length > 0 ? data.introVideos : fallback.introVideos,
      adVideos: data.adVideos,
    });
  } catch (error) {
    console.error(
      "Failed to load managed ad videos; using local intro fallback",
      error,
    );
    return NextResponse.json(getLocalFallback());
  }
}
