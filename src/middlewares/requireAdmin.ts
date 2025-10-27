import type { Elysia, Context } from "elysia";
import { auth } from "../auth";
import User from "../models/User";

export const requireAdminGuard = async (ctx: Context) => {
  const { request, set } = ctx;
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    set.status = 401;
    return { error: "Authentication required" };
  }

  const userDoc = await User.findById(session.user.id).lean();
  const role = userDoc?.role || (session.user.role as "admin" | "user") || "user";

  if (role !== "admin") {
    set.status = 403;
    return { error: "Access denied. Admins only." };
  }

  ctx.user = { id: session.user.id, email: session.user.email, role };
  ctx.session = session.session;
};

export const requireAdmin = (app: Elysia) =>
  app.derive(async (ctx: Context) => {
    const { request, set } = ctx;
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      set.status = 401;
      return { error: "Authentication required" };
    }

    const userDoc = await User.findById(session.user.id).lean();
    const role = userDoc?.role || (session.user.role as "admin" | "user") || "user";

    if (role !== "admin") {
      set.status = 403;
      return { error: "Access denied. Admins only." };
    }

    ctx.user = { id: session.user.id, email: session.user.email, role };
    ctx.session = session.session;
  });
