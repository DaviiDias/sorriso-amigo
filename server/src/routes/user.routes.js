import express from "express";
import { query } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const allowedModes = ["default", "high-contrast", "large-text"];

function isValidReminderTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

router.use(requireAuth);

router.get("/preferences", async (req, res, next) => {
  try {
    const result = await query(
      `
      SELECT reminder_enabled, reminder_times, accessibility_mode
      FROM user_preferences
      WHERE user_id = $1
      `,
      [req.user.sub]
    );

    if (!result.rowCount) {
      return res.json({
        preferences: {
          reminder_enabled: false,
          reminder_times: ["08:00", "13:00", "20:00"],
          accessibility_mode: "default"
        }
      });
    }

    return res.json({ preferences: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.put("/preferences", async (req, res, next) => {
  try {
    const {
      reminderEnabled = false,
      reminderTimes = [],
      accessibilityMode = "default"
    } = req.body;

    if (!Array.isArray(reminderTimes) || reminderTimes.some((time) => !isValidReminderTime(time))) {
      return res.status(400).json({
        message: "Horarios de lembrete invalidos. Use o formato HH:MM."
      });
    }

    if (!allowedModes.includes(accessibilityMode)) {
      return res.status(400).json({ message: "Modo de acessibilidade invalido." });
    }

    const result = await query(
      `
      INSERT INTO user_preferences (
        user_id,
        reminder_enabled,
        reminder_times,
        accessibility_mode
      )
      VALUES ($1, $2, $3::jsonb, $4)
      ON CONFLICT (user_id)
      DO UPDATE SET
        reminder_enabled = EXCLUDED.reminder_enabled,
        reminder_times = EXCLUDED.reminder_times,
        accessibility_mode = EXCLUDED.accessibility_mode,
        updated_at = NOW()
      RETURNING reminder_enabled, reminder_times, accessibility_mode
      `,
      [req.user.sub, Boolean(reminderEnabled), JSON.stringify(reminderTimes), accessibilityMode]
    );

    return res.json({ preferences: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

export default router;
