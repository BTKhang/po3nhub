import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { AdsModule } from "./modules/ads/ads.module";
import { MemberModule } from "./modules/member/member.module";
import { MovieModule } from "./modules/movie/movie.module";

@Module({
  imports: [MovieModule, AuthModule, MemberModule, AdsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
