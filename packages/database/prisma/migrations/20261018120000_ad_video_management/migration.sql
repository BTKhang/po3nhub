CREATE TABLE "AdVideo" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AdVideo_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdVideo_category_enabled_idx" ON "AdVideo"("category", "enabled");
