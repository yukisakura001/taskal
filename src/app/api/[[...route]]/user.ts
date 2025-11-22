import { Hono } from "hono";
import { logger } from "hono/logger";
import { auth } from "@/auth";
import { sessionMiddleware } from "@/lib/session-middleware";

const app = new Hono()
  .use("*", logger())
  .get("/", sessionMiddleware, async (c) => {
    const session = await auth();

    if (!session?.user) {
      return c.text("Not authenticated", 401);
    }

    return c.json({ user: session.user });
  });

export type UserType = typeof app;
export default app;
