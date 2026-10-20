import express from "express";
import { query } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { getChecklistStats, listChecklists, upsertChecklistRecord } from "../services/checklist-store.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const today = new Date();
    const defaultStart = new Date(today);
    defaultStart.setDate(today.getDate() - 14);

    const start = req.query.start || defaultStart.toISOString().slice(0, 10);
    const end = req.query.end || today.toISOString().slice(0, 10);
    const result = await listChecklists(query, req.user.sub, start, end);

    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    return res.json({ items: result.items });
  } catch (error) {
    return next(error);
  }
});

router.get("/stats", async (req, res, next) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const month = req.query.month || currentMonth;
    const result = await getChecklistStats(query, req.user.sub, month);

    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

router.put("/:date", async (req, res, next) => {
  try {
    const result = await upsertChecklistRecord(query, req.user.sub, req.params.date, req.body || {});

    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    return res.json({ item: result.item });
  } catch (error) {
    return next(error);
  }
});

export default router;
