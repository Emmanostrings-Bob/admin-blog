import { Elysia, type Context } from "elysia";

export const requireAuth = (app: Elysia) =>
  app.derive((ctx: Context) => {
    if (!ctx.user) {
      ctx.set.status = 401;
      return { error: "Authentication required" };
    }
    return { user: ctx.user };
  });
