import express from "express";
import { query } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const allowedResistance = ["none", "light", "moderate", "severe"];

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getMonthWindow(monthParam) {
  const [yearText, monthText] = monthParam.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));

  return { start, end };
}

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const today = new Date();
    const defaultStart = new Date(today);
    defaultStart.setDate(today.getDate() - 14);

    const start = req.query.start || defaultStart.toISOString().slice(0, 10);
    const end = req.query.end || today.toISOString().slice(0, 10);

    if (!isIsoDate(start) || !isIsoDate(end)) {
      return res.status(400).json({ message: "Intervalo de datas invalido." });
    }

    const result = await query(
      `
      SELECT
        checklist_date,
        brushing_morning,
        brushing_afternoon,
        brushing_night,
        resistance_level,
        notes,
        updated_at
      FROM daily_checklists
      WHERE user_id = $1
        AND checklist_date BETWEEN $2 AND $3
      ORDER BY checklist_date DESC
      `,
      [req.user.sub, start, end]
    );

    return res.json({ items: result.rows });
  } catch (error) {
    return next(error);
  }
});

router.get("/stats", async (req, res, next) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const month = req.query.month || currentMonth;

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "Mes invalido." });
    }

    const { start, end } = getMonthWindow(month);

    const result = await query(
      `
      SELECT checklist_date, brushing_morning, brushing_afternoon, brushing_night, resistance_level
      FROM daily_checklists
      WHERE user_id = $1
        AND checklist_date BETWEEN $2 AND $3
      `,
      [req.user.sub, start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]
    );

    let completedBrushings = 0;
    const resistance = {
      none: 0,
      light: 0,
      moderate: 0,
      severe: 0
    };

    for (const row of result.rows) {
      completedBrushings += Number(row.brushing_morning);
      completedBrushings += Number(row.brushing_afternoon);
      completedBrushings += Number(row.brushing_night);
      resistance[row.resistance_level] += 1;
    }

    const [yearText, monthText] = month.split("-");
    const now = new Date();
    const monthIndex = Number(monthText) - 1;
    const isCurrentMonth =
      Number(yearText) === now.getFullYear() && monthIndex === now.getMonth();

    const daysInMonth = new Date(Number(yearText), Number(monthText), 0).getDate();
    const trackedDays = isCurrentMonth ? now.getDate() : daysInMonth;

    const expectedBrushings = trackedDays * 3;
    const adherenceRate = expectedBrushings
      ? Math.round((completedBrushings / expectedBrushings) * 100)
      : 0;

    return res.json({
      month,
      completedBrushings,
      expectedBrushings,
      adherenceRate,
      resistance,
      entries: result.rowCount
    });
  } catch (error) {
    return next(error);
  }
});

router.put("/:date", async (req, res, next) => {
  try {
    const { date } = req.params;
    const {
      morning = false,
      afternoon = false,
      night = false,
      resistanceLevel = "none",
      notes = ""
    } = req.body;

    if (!isIsoDate(date)) {
      return res.status(400).json({ message: "Data invalida." });
    }

    if (!allowedResistance.includes(resistanceLevel)) {
      return res.status(400).json({ message: "Nivel de resistencia invalido." });
    }

    const result = await query(
      `
      INSERT INTO daily_checklists (
        user_id,
        checklist_date,
        brushing_morning,
        brushing_afternoon,
        brushing_night,
        resistance_level,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id, checklist_date)
      DO UPDATE SET
        brushing_morning = EXCLUDED.brushing_morning,
        brushing_afternoon = EXCLUDED.brushing_afternoon,
        brushing_night = EXCLUDED.brushing_night,
        resistance_level = EXCLUDED.resistance_level,
        notes = EXCLUDED.notes,
        updated_at = NOW()
      RETURNING *
      `,
      [
        req.user.sub,
        date,
        Boolean(morning),
        Boolean(afternoon),
        Boolean(night),
        resistanceLevel,
        String(notes || "").trim()
      ]
    );

    return res.json({ item: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

export default router;
