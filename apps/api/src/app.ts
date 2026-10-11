import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { checkDbConnection } from "./db/index.js";
import { projectsRouter } from "./routes/projects.js";

export const app = new Hono();

// Global Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin) => {
      // Allow localhost dev servers and matching origins
      if (!origin || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
        return origin || "*";
      }
      return process.env.APP_ORIGIN || origin;
    },
    credentials: true,
  })
);

// Global Error Handler
app.onError((err, c) => {
  console.error("API Unhandled Error:", err);
  return c.json(
    {
      error: "Internal Server Error",
      message: err.message,
    },
    500
  );
});

// Root & Health Checks
app.get("/", (c) => {
  return c.json({
    service: "Proof Engine API",
    version: "1.0.0",
    docs: "/healthz",
  });
});

app.get("/healthz", async (c) => {
  const isDbConnected = await checkDbConnection();
  return c.json({
    status: "ok",
    uptime: Math.round(process.uptime()),
    db: isDbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/v1/health", async (c) => {
  const isDbConnected = await checkDbConnection();
  return c.json({
    status: "ok",
    uptime: Math.round(process.uptime()),
    db: isDbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.route("/api/v1/projects", projectsRouter);
