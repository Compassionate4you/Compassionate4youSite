-- DT-846: profile info saved from Profile Settings on the Customer Portal
ALTER TABLE "User" ADD COLUMN "address" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "state" TEXT,
ADD COLUMN "zip" TEXT,
ADD COLUMN "emergencyName" TEXT,
ADD COLUMN "emergencyPhone" TEXT,
ADD COLUMN "emailNotif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "smsNotif" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "preferredContact" TEXT NOT NULL DEFAULT 'email';