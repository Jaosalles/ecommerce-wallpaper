-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");

-- CreateIndex
CREATE INDEX "Collection_slug_idx" ON "Collection"("slug");

-- Add column to Product
ALTER TABLE "Product" ADD COLUMN "collectionId" TEXT;

-- Backfill collections from existing product categories
INSERT INTO "Collection" ("id", "name", "slug", "description", "createdAt", "updatedAt")
SELECT
  'col_' || md5(LOWER(TRIM("category"))) AS "id",
  TRIM("category") AS "name",
  LOWER(REGEXP_REPLACE(TRIM("category"), '[^a-zA-Z0-9]+', '-', 'g')) AS "slug",
  NULL AS "description",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Product"
GROUP BY TRIM("category");

-- Link products to generated collections
UPDATE "Product" p
SET "collectionId" = c."id"
FROM "Collection" c
WHERE c."name" = TRIM(p."category");

-- Enforce not null after backfill
ALTER TABLE "Product" ALTER COLUMN "collectionId" SET NOT NULL;

-- Replace old category index/column
DROP INDEX IF EXISTS "Product_category_idx";
ALTER TABLE "Product" DROP COLUMN "category";

-- CreateIndex
CREATE INDEX "Product_collectionId_idx" ON "Product"("collectionId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
