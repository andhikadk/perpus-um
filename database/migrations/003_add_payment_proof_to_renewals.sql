-- Migration: Add payment_proof to renewals table
-- This stores the payment proof when renewal request is created

ALTER TABLE renewals
ADD COLUMN payment_proof_path VARCHAR(500) AFTER request_date;
