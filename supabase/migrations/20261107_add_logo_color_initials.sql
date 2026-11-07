-- Migration: Add logo_color and initials columns to startups table
ALTER TABLE startups 
ADD COLUMN IF NOT EXISTS logo_color text,
ADD COLUMN IF NOT EXISTS initials text;

