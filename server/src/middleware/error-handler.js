export function notFoundHandler(req, res) {
  res.status(404).json({ message: "Recurso nao encontrado." });
}

export function errorHandler(error, req, res, next) {
  const status = error.status || 500;
  const message = error.message || "Erro interno no servidor.";

  if (status >= 500) {
    console.error("[erro]", error);
  }

  res.status(status).json({ message });
}
