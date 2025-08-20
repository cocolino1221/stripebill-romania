-- Migration to update eliminated VAT rates (5% and 9%) to legal rates
-- Run this in production to ensure compliance with August 2025 Romanian legislation

-- Update users who had 5% VAT (eliminated) to 11% VAT (new reduced rate)
UPDATE users 
SET defaultVatRate = 11 
WHERE defaultVatRate = 5;

-- Update users who had 9% VAT (eliminated) to 11% VAT (new reduced rate)  
UPDATE users 
SET defaultVatRate = 9 
WHERE defaultVatRate = 9;

-- Update any invoices that had eliminated VAT rates
UPDATE invoices 
SET vatRate = 11 
WHERE vatRate IN (5, 9);

-- Log the changes for audit
INSERT INTO webhook_events (stripeEventId, eventType, processed, error, createdAt) 
VALUES (
  'vat_rate_migration_' || datetime('now'), 
  'vat_rate_update_august_2025', 
  1, 
  'Updated eliminated VAT rates (5%, 9%) to 11% for legal compliance',
  datetime('now')
);