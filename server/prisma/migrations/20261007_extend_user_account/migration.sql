/*DT-528: Extend user account database schema */

ALTER TABLE "User"
ADD COLUMN "name" TEXT,                                             /*Adding name since it didnt exist */
ADD COLUMN "phone" TEXT,                                            
ADD COLUMN "role" TEXT NOT NULL DEFAULT 'customer',                 /*Adding a role column, cannot be empty, default is alway customer */
ADD COLUMN "accountStatus" TEXT NOT NULL DEFAULT 'active';          /*Adding account status to every customer and admin*/