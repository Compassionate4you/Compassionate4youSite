-- CreateTable
CREATE TABLE IF NOT EXISTS "text_entries" (
    "id" TEXT NOT NULL,
    "json_path" TEXT NOT NULL,
    "english_text" TEXT NOT NULL,

    CONSTRAINT "text_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "colors" (
    "id" TEXT NOT NULL,
    "light_mode_color" TEXT NOT NULL,
    "dark_mode_color" TEXT NOT NULL,

    CONSTRAINT "colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_created_pages" (
    "id" TEXT NOT NULL,
    "content" JSONB NOT NULL,

    CONSTRAINT "user_created_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_created_sections" (
    "id" TEXT NOT NULL,
    "layout" TEXT NOT NULL,
    "content" JSONB NOT NULL,

    CONSTRAINT "user_created_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_created_cards" (
    "id" TEXT NOT NULL,
    "layout" TEXT NOT NULL,
    "content" JSONB NOT NULL,

    CONSTRAINT "user_created_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "applied_changes" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "change_content" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'applied',

    CONSTRAINT "applied_changes_pkey" PRIMARY KEY ("id")
);
