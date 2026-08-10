import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import authRoutes from "./routes/auth.routes.js";
import checklistRoutes from "./routes/checklist.routes.js";
import guideRoutes from "./routes/guide.routes.js";
import healthRoutes from "./routes/health.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import userRoutes from "./routes/user.routes.js";
import videosRoutes from "./routes/videos.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDirectory = path.resolve(__dirname, "../../code");

const app = express();

const allowedOrigins = env.frontendOrigin
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

app.set("trust proxy", true);

app.use(
  cors((req, callback) => {
    const origin = req.headers.origin;

    // Sem Origin: chamadas do proprio servidor, curl ou app nativo.
    if (!origin) {
      return callback(null, { origin: true });
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, { origin: true });
    }

    // O front e servido pelo proprio Express: a origem igual ao host da
    // requisicao e sempre a mesma aplicacao, entao pode ser liberada.
    const sameHostOrigin = `${req.protocol}://${req.headers.host}`;
    if (origin === sameHostOrigin) {
      return callback(null, { origin: true });
    }

    // Fora de producao, uma lista vazia libera tudo para facilitar o dev.
    if (!env.isProduction && !allowedOrigins.length) {
      return callback(null, { origin: true });
    }

    return callback(new Error("Origem nao autorizada"));
  })
);

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/config", (req, res) => {
  return res.json({
    publicAccessMode: env.publicAccessMode
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/checklists", checklistRoutes);
app.use("/api/guide", guideRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/videos", videosRoutes);
app.use("/api/user", userRoutes);

app.use(express.static(staticDirectory));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  return res.sendFile(path.join(staticDirectory, "index.html"));
});

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
