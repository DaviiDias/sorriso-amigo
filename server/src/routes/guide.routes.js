import express from "express";
import { query } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/steps", async (req, res, next) => {
  try {
    const result = await query(
      `
      SELECT id, step_order, title, description, image_url
      FROM guide_steps
      ORDER BY step_order ASC
      `
    );

    return res.json({ steps: result.rows });
  } catch (error) {
    return next(error);
  }
});

export default router;
