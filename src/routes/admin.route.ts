import { Elysia, t, type Context } from "elysia";
import { createPost, updatePost, deletePost } from "../handlers/postHandler";
import { requireAdminGuard } from "../middlewares/requireAdmin";

export const adminRoutes = (app: Elysia) =>
  app
    .guard({ beforeHandle: [requireAdminGuard] })
    .group("/admin", (group) =>
      group
        .post(
          "/post",
          (ctx: Context) => createPost(ctx.body, ctx.user!.id),
          {
            body: t.Object({
              title: t.String({ minLength: 3, maxLength: 50 }),
              content: t.String({ minLength: 3, maxLength: 100 }),
            }),
          }
        )
        .put(
          "/post/:id",
          (ctx: Context) => updatePost(ctx.params.id, ctx.body, ctx.user!),
          {
            params: t.Object({ id: t.Numeric() }),
            body: t.Object({
              title: t.Optional(t.String({ minLength: 3 })),
              content: t.Optional(t.String({ minLength: 3 })),
            }),
          }
        )
        .delete(
          "/post/:id",
          (ctx: Context) => deletePost(ctx.params.id, ctx.user!),
          {
            params: t.Object({ id: t.Numeric() }),
          }
        )
    );
