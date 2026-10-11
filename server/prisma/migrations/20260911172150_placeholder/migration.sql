-- Placeholder table used while the real schema was being written.
-- The table was dropped once the actual models landed; this file exists so
-- the migration history on disk matches what was applied to the database.

-- CreateTable
CREATE TABLE "placeholder" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "placeholder_pkey" PRIMARY KEY ("id")
);

-- DropTable
DROP TABLE "placeholder";
