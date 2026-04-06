import express from "express";
import { query } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/questions", async (req, res, next) => {
  try {
    const result = await query(
      `
      SELECT
        q.id AS question_id,
        q.question_text,
        q.category,
        o.id AS option_id,
        o.option_text
      FROM quiz_questions q
      JOIN quiz_options o ON o.question_id = q.id
      ORDER BY q.id ASC, o.id ASC
      `
    );

    const grouped = new Map();

    for (const row of result.rows) {
      if (!grouped.has(row.question_id)) {
        grouped.set(row.question_id, {
          id: row.question_id,
          question: row.question_text,
          category: row.category,
          options: []
        });
      }

      grouped.get(row.question_id).options.push({
        id: row.option_id,
        text: row.option_text
      });
    }

    return res.json({ questions: Array.from(grouped.values()) });
  } catch (error) {
    return next(error);
  }
});

router.post("/submit", async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Envie as respostas do quiz." });
    }

    const normalizedAnswers = answers
      .map((answer) => ({
        questionId: Number(answer.questionId),
        optionId: Number(answer.optionId)
      }))
      .filter((answer) => Number.isInteger(answer.questionId));

    if (!normalizedAnswers.length) {
      return res.status(400).json({ message: "Respostas invalidas." });
    }

    const questionIds = [...new Set(normalizedAnswers.map((answer) => answer.questionId))];

    const optionsResult = await query(
      `
      SELECT id AS option_id, question_id, is_correct, explanation
      FROM quiz_options
      WHERE question_id = ANY($1::int[])
      `,
      [questionIds]
    );

    const optionsByQuestion = new Map();

    for (const row of optionsResult.rows) {
      if (!optionsByQuestion.has(row.question_id)) {
        optionsByQuestion.set(row.question_id, []);
      }

      optionsByQuestion.get(row.question_id).push(row);
    }

    let score = 0;
    const feedback = [];

    for (const answer of normalizedAnswers) {
      const options = optionsByQuestion.get(answer.questionId) || [];
      const selected = options.find((option) => option.option_id === answer.optionId);
      const correct = options.find((option) => option.is_correct);

      if (!selected || !correct) {
        feedback.push({
          questionId: answer.questionId,
          selectedOptionId: answer.optionId,
          correctOptionId: correct ? correct.option_id : null,
          isCorrect: false,
          explanation:
            correct?.explanation ||
            "Nao foi possivel validar esta resposta. Tente novamente."
        });
        continue;
      }

      if (selected.is_correct) {
        score += 1;
      }

      feedback.push({
        questionId: answer.questionId,
        selectedOptionId: selected.option_id,
        correctOptionId: correct.option_id,
        isCorrect: selected.is_correct,
        explanation: correct.explanation
      });
    }

    const attemptResult = await query(
      `
      INSERT INTO quiz_attempts (user_id, score, total_questions)
      VALUES ($1, $2, $3)
      RETURNING id, created_at
      `,
      [req.user.sub, score, normalizedAnswers.length]
    );

    const attempt = attemptResult.rows[0];

    for (const item of feedback) {
      await query(
        `
        INSERT INTO quiz_attempt_answers (
          attempt_id,
          question_id,
          selected_option_id,
          is_correct
        )
        VALUES ($1, $2, $3, $4)
        `,
        [attempt.id, item.questionId, item.selectedOptionId, item.isCorrect]
      );
    }

    const percentage = Math.round((score / normalizedAnswers.length) * 100);

    return res.json({
      score,
      total: normalizedAnswers.length,
      percentage,
      feedback,
      attempt
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/history", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 10), 50);

    const result = await query(
      `
      SELECT id, score, total_questions, created_at
      FROM quiz_attempts
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
      `,
      [req.user.sub, limit]
    );

    return res.json({ attempts: result.rows });
  } catch (error) {
    return next(error);
  }
});

export default router;
