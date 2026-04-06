import express from "express";
import { query } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const result = await query(
      `
      SELECT id, title, description, url, audience, created_at
      FROM educational_videos
      ORDER BY created_at DESC
      `
    );

    return res.json({ videos: result.rows });
  } catch (error) {
    return next(error);
  }
});

export default router;
