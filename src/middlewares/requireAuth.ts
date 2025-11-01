import { Elysia } from "elysia";
import { auth } from "../auth";

export const requireAuth = new Elysia({ name: "require-auth" })
  .derive(async (ctx) => {
    const headers = ctx.request?.headers ?? ctx.headers;
    const session = await auth.api.getSession({ headers });

    if (!session || !session.user) {
      throw new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return {
      user: session.user,
      session: session.session,
    };
  });
