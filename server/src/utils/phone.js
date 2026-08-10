/**
 * Normaliza o telefone para apenas digitos e valida o formato brasileiro
 * (DDD + 8 ou 9 digitos). Retorna null quando invalido.
 */
export function normalizePhone(rawPhone) {
  const digits = String(rawPhone || "").replace(/\D/g, "");
  const withoutCountry = digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits;

  if (!/^[1-9]{2}9?\d{8}$/.test(withoutCountry)) {
    return null;
  }

  return withoutCountry;
}

export function maskPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.length < 10) {
    return phone;
  }

  const ddd = digits.slice(0, 2);
  const last = digits.slice(-4);

  return `(${ddd}) ${"*".repeat(digits.length - 6)}-${last}`;
}
