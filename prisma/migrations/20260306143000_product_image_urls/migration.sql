-- Add multi-image support for products (max 3 images)
ALTER TABLE "Product"
ADD COLUMN "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "Product"
SET "imageUrls" = ARRAY["imageUrl"]
WHERE "imageUrl" IS NOT NULL AND btrim("imageUrl") <> '';

ALTER TABLE "Product"
ADD CONSTRAINT "Product_imageUrls_max_3_check"
CHECK (cardinality("imageUrls") <= 3);

ALTER TABLE "Product"
DROP COLUMN "imageUrl";
