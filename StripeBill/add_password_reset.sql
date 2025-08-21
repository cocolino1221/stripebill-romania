-- Add password reset fields to users table
ALTER TABLE users ADD COLUMN "passwordResetToken" TEXT;
ALTER TABLE users ADD COLUMN "passwordResetExpires" TIMESTAMP(3);