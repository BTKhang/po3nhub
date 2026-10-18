import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "../../auth/application/auth.service";
import { getSessionToken } from "../../auth/infrastructure/session-cookie";
import { AdsService, type AdVideoCategory } from "../application/ads.service";

const ADMIN_EMAIL = "buitan.khang.189@gmail.com";

@Controller("ads")
export class AdsController {
  constructor(
    private readonly adsService: AdsService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  listPublicVideos() {
    return this.adsService.listPublicVideos();
  }

  @Get("manage")
  async listAdminVideos(@Req() request: Request) {
    await this.requireAdmin(request);
    return { items: await this.adsService.listAdminVideos() };
  }

  @Post("manage")
  async createVideo(
    @Req() request: Request,
    @Body()
    body: {
      title: string;
      url: string;
      category: AdVideoCategory;
    },
  ) {
    await this.requireAdmin(request);
    return { item: await this.adsService.createVideo(body) };
  }

  @Delete("manage/:id")
  async deleteVideo(@Req() request: Request, @Param("id") id: string) {
    await this.requireAdmin(request);
    return this.adsService.deleteVideo(id);
  }

  private async requireAdmin(request: Request) {
    const user = await this.authService.getCurrentUser(
      getSessionToken(request),
    );
    if (!user) {
      throw new UnauthorizedException("Vui lòng đăng nhập tài khoản quản trị");
    }
    if (user.email.toLowerCase() !== ADMIN_EMAIL) {
      throw new ForbiddenException(
        "Bạn không có quyền quản lý video quảng cáo",
      );
    }
    return user;
  }
}
