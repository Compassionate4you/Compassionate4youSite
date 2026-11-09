-- DT-837 Sprint 9: appointment history for the admin dashboard.
-- Adds a history tag, archiving instead of deleting, and moves the
-- one-booking-per-slot rule to a column that is cleared when an appointment
-- is cancelled or archived, so those appointments stay in history.

-- CreateEnum
CREATE TYPE "AppointmentHistoryTag" AS ENUM ('COMPLETED', 'NO_SHOW', 'CANCELLED_BY_PATIENT', 'CANCELLED_BY_STAFF', 'NOT_CONFIRMED');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "active_slot" TEXT,
ADD COLUMN     "archived_at" TIMESTAMP(3),
ADD COLUMN     "history_tag" "AppointmentHistoryTag";

-- Existing bookings that are not cancelled keep holding their slot.
-- The old unique index guarantees these values are already unique.
UPDATE "appointments"
SET "active_slot" = "date" || '|' || "time_slot"
WHERE "status" <> 'CANCELLED';

-- DropIndex
DROP INDEX "appointments_date_time_slot_key";

-- CreateIndex
CREATE UNIQUE INDEX "appointments_active_slot_key" ON "appointments"("active_slot");
