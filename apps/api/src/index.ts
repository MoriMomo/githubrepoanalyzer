import { serve } from "@hono/node-server";
import { app } from "./app.js";
import "dotenv/config";

const port = Number(process.env.PORT) || 3001;

console.log(`Starting Proof API Server on port ${port}...`);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`🚀 Proof API listening at http://localhost:${info.port}`);
    console.log(`Healthcheck endpoint: http://localhost:${info.port}/healthz`);
  }
);
