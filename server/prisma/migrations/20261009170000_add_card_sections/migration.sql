-- CreateEnum
CREATE TYPE "CardLayout" AS ENUM ('IMAGE_FULL_WIDTH', 'HEADER_PARAGRAPH', 'HEADER_SYMBOL');

-- CreateTable
CREATE TABLE "card_sections" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "title" JSONB NOT NULL DEFAULT '{}',
    "rows" INTEGER NOT NULL DEFAULT 1,
    "columns" INTEGER NOT NULL DEFAULT 3,
    "card_count" INTEGER NOT NULL DEFAULT 3,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "layout_type" "CardLayout" NOT NULL,
    "header" JSONB NOT NULL DEFAULT '{}',
    "paragraph" JSONB NOT NULL DEFAULT '{}',
    "image_url" TEXT,
    "image_alt" JSONB NOT NULL DEFAULT '{}',
    "symbol" TEXT,
    "alignment" TEXT NOT NULL DEFAULT 'left',

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "card_sections_slug_key" ON "card_sections"("slug");

-- CreateIndex
CREATE INDEX "card_sections_page_position_idx" ON "card_sections"("page", "position");

-- CreateIndex
CREATE INDEX "cards_section_id_position_idx" ON "cards"("section_id", "position");

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "card_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

