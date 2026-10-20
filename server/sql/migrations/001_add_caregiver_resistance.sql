-- F04: resistência do responsável, anulável, sem apagar histórico.
ALTER TABLE daily_checklists
  ADD COLUMN IF NOT EXISTS caregiver_resistance_level VARCHAR(16);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'daily_checklists_caregiver_resistance_level_check'
  ) THEN
    ALTER TABLE daily_checklists
      ADD CONSTRAINT daily_checklists_caregiver_resistance_level_check
      CHECK (
        caregiver_resistance_level IS NULL
        OR caregiver_resistance_level IN ('none', 'light', 'moderate', 'severe')
      );
  END IF;
END $$;
