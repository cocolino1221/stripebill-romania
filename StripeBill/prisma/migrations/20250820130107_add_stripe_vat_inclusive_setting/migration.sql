-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "stripeAccountId" TEXT,
    "stripeAccessToken" TEXT,
    "stripeConnectClientId" TEXT,
    "userWebhookToken" TEXT,
    "stripeCustomerId" TEXT,
    "subscriptionId" TEXT,
    "subscriptionStatus" TEXT,
    "subscriptionPriceId" TEXT,
    "subscriptionCurrentPeriodEnd" DATETIME,
    "freeInvoicesUsed" INTEGER NOT NULL DEFAULT 0,
    "invoiceProvider" TEXT,
    "smartbillApiKey" TEXT,
    "smartbillUsername" TEXT,
    "fgoApiKey" TEXT,
    "invoiceSeries" TEXT,
    "companyName" TEXT,
    "companyVat" TEXT,
    "companyAddress" TEXT,
    "bankAccount" TEXT,
    "defaultVatRate" INTEGER NOT NULL DEFAULT 21,
    "stripePricesIncludeVat" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_users" ("bankAccount", "companyAddress", "companyName", "companyVat", "createdAt", "defaultVatRate", "email", "emailVerified", "fgoApiKey", "freeInvoicesUsed", "id", "image", "invoiceProvider", "invoiceSeries", "name", "password", "smartbillApiKey", "smartbillUsername", "stripeAccessToken", "stripeAccountId", "stripeConnectClientId", "stripeCustomerId", "subscriptionCurrentPeriodEnd", "subscriptionId", "subscriptionPriceId", "subscriptionStatus", "updatedAt", "userWebhookToken") SELECT "bankAccount", "companyAddress", "companyName", "companyVat", "createdAt", "defaultVatRate", "email", "emailVerified", "fgoApiKey", "freeInvoicesUsed", "id", "image", "invoiceProvider", "invoiceSeries", "name", "password", "smartbillApiKey", "smartbillUsername", "stripeAccessToken", "stripeAccountId", "stripeConnectClientId", "stripeCustomerId", "subscriptionCurrentPeriodEnd", "subscriptionId", "subscriptionPriceId", "subscriptionStatus", "updatedAt", "userWebhookToken" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
