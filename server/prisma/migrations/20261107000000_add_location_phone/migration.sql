-- DT-840: Add phone numbers to locations
ALTER TABLE "locations"
ADD COLUMN IF NOT EXISTS "phone" TEXT;