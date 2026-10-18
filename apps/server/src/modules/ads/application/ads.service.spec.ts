import { BadRequestException, NotFoundException } from "@nestjs/common";
import { AdsService } from "./ads.service";

const createPrismaMock = () => ({
  adVideo: {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
});

describe("AdsService", () => {
  it("groups enabled videos into intros and mid-roll ads", async () => {
    const prisma = createPrismaMock();
    const intro = {
      id: "intro-1",
      category: "intro",
      url: "https://cdn.test/i.mp4",
    };
    const ad = { id: "ad-1", category: "ad", url: "https://cdn.test/a.mp4" };
    prisma.adVideo.findMany.mockResolvedValue([intro, ad]);

    const result = await new AdsService(prisma as never).listPublicVideos();

    expect(result).toEqual({
      introVideos: [intro],
      adVideos: [ad],
    });
    expect(prisma.adVideo.findMany).toHaveBeenCalledWith({
      where: { enabled: true },
      orderBy: { createdAt: "asc" },
    });
  });

  it("validates video URLs before saving", async () => {
    const prisma = createPrismaMock();
    const service = new AdsService(prisma as never);

    expect(() =>
      service.createVideo({
        title: "Invalid video",
        url: "javascript:alert(1)",
        category: "intro",
      }),
    ).toThrow(BadRequestException);
    expect(prisma.adVideo.create).not.toHaveBeenCalled();
  });

  it("rejects malformed video input", () => {
    const service = new AdsService(createPrismaMock() as never);

    expect(() => service.createVideo(null as never)).toThrow(
      BadRequestException,
    );
  });

  it("stores trimmed video metadata", async () => {
    const prisma = createPrismaMock();
    prisma.adVideo.create.mockResolvedValue({ id: "video-1" });

    const result = await new AdsService(prisma as never).createVideo({
      title: "  Brand intro  ",
      url: " https://cdn.test/intro.mp4 ",
      category: "intro",
    });

    expect(result).toEqual({ id: "video-1" });
    expect(prisma.adVideo.create).toHaveBeenCalledWith({
      data: {
        title: "Brand intro",
        url: "https://cdn.test/intro.mp4",
        category: "intro",
      },
    });
  });

  it("returns not found when deleting an unknown video", async () => {
    const prisma = createPrismaMock();
    prisma.adVideo.deleteMany.mockResolvedValue({ count: 0 });

    await expect(
      new AdsService(prisma as never).deleteVideo("missing-video"),
    ).rejects.toThrow(NotFoundException);
  });
});
