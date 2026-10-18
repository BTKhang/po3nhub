import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { AuthModule } from "../auth/auth.module";
import { AdsService } from "./application/ads.service";
import { AdsController } from "./infrastructure/ads.controller";

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AdsController],
  providers: [AdsService],
})
export class AdsModule {}
