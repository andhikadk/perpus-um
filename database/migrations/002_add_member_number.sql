-- ============================================
-- Migration: Add Member Number Column
-- Description: Add member_number column with auto-generation for existing members
-- ============================================

USE joki_balqis_library_app;

-- Add member_number column if it doesn't exist
ALTER TABLE members
ADD COLUMN member_number VARCHAR(20) UNIQUE AFTER id;

-- Auto-generate member numbers for existing members without one
-- Format: UM-YYYYMMDD-XXXX (e.g., UM-20241115-0001)
SET @counter = 0;
UPDATE members
SET member_number = CONCAT(
    'UM-',
    DATE_FORMAT(COALESCE(registration_date, created_at, NOW()), '%Y%m%d'),
    '-',
    LPAD((@counter := @counter + 1), 4, '0')
)
WHERE member_number IS NULL
ORDER BY id ASC;

COMMIT;
