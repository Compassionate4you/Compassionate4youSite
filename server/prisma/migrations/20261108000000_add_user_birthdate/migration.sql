-- DT-842: Add birthdate column to the users table
ALTER TABLE "User"
ADD COLUMN "birthdate" DATE;