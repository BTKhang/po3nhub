import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";

export type AdVideoCategory = "intro" | "ad";

export interface CreateAdVideoInput {
  title: string;
  url: string;
  category: AdVideoCategory;
}

@Injectable()
export class AdsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublicVideos() {
    const videos = await this.prisma.adVideo.findMany({
      where: { enabled: true },
      orderBy: { createdAt: "asc" },
    });

    return {
      introVideos: videos.filter((video) => video.category === "intro"),
      adVideos: videos.filter((video) => video.category === "ad"),
    };
  }

  listAdminVideos() {
    return this.prisma.adVideo.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  createVideo(input: CreateAdVideoInput) {
    if (
      !input ||
      typeof input.title !== "string" ||
      typeof input.url !== "string"
    ) {
      throw new BadRequestException("Vui lòng nhập tên và URL video");
    }

    const title = input.title.trim();
    const urlValue = input.url.trim();

    if (!title || title.length > 100) {
      throw new BadRequestException("Tên video phải có từ 1 đến 100 ký tự");
    }

    if (input.category !== "intro" && input.category !== "ad") {
      throw new BadRequestException("Loại video không hợp lệ");
    }

    let url: URL;
    try {
      url = new URL(urlValue);
    } catch {
      throw new BadRequestException("URL video không hợp lệ");
    }

    if (
      (url.protocol !== "https:" && url.protocol !== "http:") ||
      url.username ||
      url.password ||
      urlValue.length > 2048
    ) {
      throw new BadRequestException(
        "Vui lòng nhập URL video HTTP hoặc HTTPS hợp lệ",
      );
    }

    return this.prisma.adVideo.create({
      data: {
        title,
        url: urlValue,
        category: input.category,
      },
    });
  }

  async deleteVideo(id: string) {
    const result = await this.prisma.adVideo.deleteMany({ where: { id } });
    if (result.count === 0) {
      throw new NotFoundException("Không tìm thấy video quảng cáo");
    }
    return { success: true };
  }
}
