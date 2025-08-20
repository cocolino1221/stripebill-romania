-- AlterTable
ALTER TABLE "users" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "users" ADD COLUMN "subscriptionCurrentPeriodEnd" DATETIME;
ALTER TABLE "users" ADD COLUMN "subscriptionPriceId" TEXT;
