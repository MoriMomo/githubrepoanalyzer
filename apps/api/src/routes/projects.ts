import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { UpsertProjectInputSchema } from "@proof/contracts";
import { enforceGrounding } from "@proof/core";

export const projectsRouter = new Hono();

/**
 * GET /api/v1/projects
 * Lists all projects for the authenticated user (or active session)
 */
projectsRouter.get("/", async (c) => {
  // Skeleton list endpoint ready for Phase 4 query implementation
  return c.json({
    data: [],
    total: 0,
    message: "Project repository ready",
  });
});

/**
 * GET /api/v1/projects/:id
 * Fetches single project session by ID
 */
projectsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  return c.json({
    id,
    message: "Project retrieval endpoint ready",
  });
});

/**
 * PUT /api/v1/projects/:id
 * Upserts project session with server-side enforceGrounding validation pass
 */
projectsRouter.put(
  "/:id",
  zValidator("json", UpsertProjectInputSchema),
  async (c) => {
    const session = c.req.valid("json").session;

    // Authoritative Server-Side Grounding Check (§8 Anti-Fabrication Guarantee)
    const rawSource = session.signals?.rawSource || "";
    const drillAnswers = Object.values(session.drillAnswers || {}).join(" ");
    const groundedCorpus = `${rawSource} ${drillAnswers}`;

    const authoritativelyGroundedBullets = enforceGrounding(
      session.bullets || [],
      groundedCorpus
    );

    const verifiedSession = {
      ...session,
      bullets: authoritativelyGroundedBullets,
      updatedAt: Date.now(),
      version: (session.version || 1) + 1,
    };

    return c.json({
      success: true,
      session: verifiedSession,
      version: verifiedSession.version,
    });
  }
);
