export const ALLOWED_RESISTANCE_LEVELS = ["none", "light", "moderate", "severe"];

export function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key);
}

export function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function getMonthWindow(monthParam) {
  const [yearText, monthText] = monthParam.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));

  return { start, end };
}

export function parseResistanceValue(value, { allowNull = false } = {}) {
  if (value === undefined) {
    return { ok: false, missing: true };
  }

  if (value === null || value === "") {
    if (allowNull) {
      return { ok: true, value: null };
    }

    return { ok: false, message: "Nivel de resistencia da pessoa com TEA invalido." };
  }

  if (typeof value !== "string" || !ALLOWED_RESISTANCE_LEVELS.includes(value)) {
    return { ok: false, message: "Nivel de resistencia invalido." };
  }

  return { ok: true, value };
}

export function resolveUpsertResistances(body = {}, existing = null) {
  let resistanceLevel;

  if (hasOwn(body, "resistanceLevel")) {
    const parsed = parseResistanceValue(body.resistanceLevel, { allowNull: false });

    if (!parsed.ok) {
      return {
        ok: false,
        message: parsed.message || "Nivel de resistencia da pessoa com TEA invalido."
      };
    }

    resistanceLevel = parsed.value;
  } else if (existing?.resistance_level) {
    resistanceLevel = existing.resistance_level;
  } else {
    resistanceLevel = "none";
  }

  let caregiverResistanceLevel;

  if (hasOwn(body, "caregiverResistanceLevel")) {
    const parsed = parseResistanceValue(body.caregiverResistanceLevel, { allowNull: true });

    if (!parsed.ok) {
      return {
        ok: false,
        message: "Nivel de resistencia do responsavel invalido."
      };
    }

    caregiverResistanceLevel = parsed.value;
  } else if (existing) {
    caregiverResistanceLevel =
      existing.caregiver_resistance_level === undefined
        ? null
        : existing.caregiver_resistance_level;
  } else {
    caregiverResistanceLevel = null;
  }

  return {
    ok: true,
    resistanceLevel,
    caregiverResistanceLevel
  };
}

export function emptyResistanceStats() {
  return {
    none: 0,
    light: 0,
    moderate: 0,
    severe: 0
  };
}

export function countTeaResistance(rows) {
  const resistance = emptyResistanceStats();

  for (const row of rows) {
    if (Object.prototype.hasOwnProperty.call(resistance, row.resistance_level)) {
      resistance[row.resistance_level] += 1;
    }
  }

  return resistance;
}
