import {
  countTeaResistance,
  getMonthWindow,
  isIsoDate,
  resolveUpsertResistances
} from "./checklist.js";

const LIST_SQL = `
  SELECT
    checklist_date::text AS checklist_date,
    brushing_morning,
    brushing_afternoon,
    brushing_night,
    resistance_level,
    caregiver_resistance_level,
    notes,
    updated_at
  FROM daily_checklists
  WHERE user_id = $1
    AND checklist_date BETWEEN $2 AND $3
  ORDER BY checklist_date DESC
`;

const STATS_SQL = `
  SELECT checklist_date::text AS checklist_date, brushing_morning, brushing_afternoon, brushing_night, resistance_level
  FROM daily_checklists
  WHERE user_id = $1
    AND checklist_date BETWEEN $2 AND $3
`;

const FIND_SQL = `
  SELECT resistance_level, caregiver_resistance_level
  FROM daily_checklists
  WHERE user_id = $1
    AND checklist_date = $2
`;

const UPSERT_SQL = `
  INSERT INTO daily_checklists (
    user_id,
    checklist_date,
    brushing_morning,
    brushing_afternoon,
    brushing_night,
    resistance_level,
    caregiver_resistance_level,
    notes
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  ON CONFLICT (user_id, checklist_date)
  DO UPDATE SET
    brushing_morning = EXCLUDED.brushing_morning,
    brushing_afternoon = EXCLUDED.brushing_afternoon,
    brushing_night = EXCLUDED.brushing_night,
    resistance_level = EXCLUDED.resistance_level,
    caregiver_resistance_level = EXCLUDED.caregiver_resistance_level,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING
    id,
    user_id,
    checklist_date::text AS checklist_date,
    brushing_morning,
    brushing_afternoon,
    brushing_night,
    resistance_level,
    caregiver_resistance_level,
    notes,
    created_at,
    updated_at
`;

export async function listChecklists(query, userId, start, end) {
  if (!isIsoDate(start) || !isIsoDate(end)) {
    return { error: { status: 400, message: "Intervalo de datas invalido." } };
  }

  const result = await query(LIST_SQL, [userId, start, end]);
  return { items: result.rows };
}

export async function getChecklistStats(query, userId, month) {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return { error: { status: 400, message: "Mes invalido." } };
  }

  const { start, end } = getMonthWindow(month);
  const result = await query(STATS_SQL, [
    userId,
    start.toISOString().slice(0, 10),
    end.toISOString().slice(0, 10)
  ]);

  let completedBrushings = 0;

  for (const row of result.rows) {
    completedBrushings += Number(row.brushing_morning);
    completedBrushings += Number(row.brushing_afternoon);
    completedBrushings += Number(row.brushing_night);
  }

  const [yearText, monthText] = month.split("-");
  const daysInMonth = new Date(Number(yearText), Number(monthText), 0).getDate();
  const expectedBrushings = daysInMonth * 3;
  const adherenceRate = expectedBrushings
    ? Math.round((completedBrushings / expectedBrushings) * 100)
    : 0;

  return {
    month,
    completedBrushings,
    expectedBrushings,
    adherenceRate,
    resistance: countTeaResistance(result.rows),
    entries: result.rowCount
  };
}

export async function upsertChecklistRecord(query, userId, date, body = {}) {
  if (!isIsoDate(date)) {
    return { error: { status: 400, message: "Data invalida." } };
  }

  const existingResult = await query(FIND_SQL, [userId, date]);
  const existing = existingResult.rows[0] || null;
  const resolved = resolveUpsertResistances(body, existing);

  if (!resolved.ok) {
    return { error: { status: 400, message: resolved.message } };
  }

  const result = await query(UPSERT_SQL, [
    userId,
    date,
    Boolean(body.morning),
    Boolean(body.afternoon),
    Boolean(body.night),
    resolved.resistanceLevel,
    resolved.caregiverResistanceLevel,
    String(body.notes || "").trim()
  ]);

  return { item: result.rows[0] };
}
