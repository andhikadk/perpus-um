-- ============================================
-- Migration: Add Membership Expiry Date
-- Description: Add membership_expiry_date column to members table
-- ============================================

USE joki_balqis_library_app;

-- Add membership_expiry_date column if it doesn't exist
ALTER TABLE members
ADD COLUMN IF NOT EXISTS membership_expiry_date DATE AFTER rejection_reason;

-- Add index for membership_expiry_date to improve query performance
ALTER TABLE members
ADD INDEX IF NOT EXISTS idx_membership_expiry_date (membership_expiry_date);

-- Optional: Set default expiry date for already approved members (1 year from now)
-- This will set expiry date for members who were already approved but don't have an expiry date set
UPDATE members
SET membership_expiry_date = DATE_ADD(NOW(), INTERVAL 1 YEAR)
WHERE status = 'approved' AND membership_expiry_date IS NULL;

-- Ensure renewals table has new_expiry_date column properly set up
ALTER TABLE renewals
MODIFY COLUMN new_expiry_date DATE;

-- Add index for status if not exists for better query performance
ALTER TABLE renewals
ADD INDEX IF NOT EXISTS idx_renewal_status (status);

ALTER TABLE renewals
ADD INDEX IF NOT EXISTS idx_request_date (request_date);

COMMIT;
