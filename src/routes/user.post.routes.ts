import { Elysia, t, type Context } from "elysia";
import { createPost, updatePost, deletePost } from "../handlers/postHandler";

export const userPostRoutes = (app: Elysia) =>
  app
    .group("/user/posts", (group) =>
      group
        .post(
          "/",
          (ctx: Context) => createPost(ctx.body, ctx.user!.id),
          {
            auth: true, 
            body: t.Object({
              title: t.String({ minLength: 3, maxLength: 50 }),
              content: t.String({ minLength: 3, maxLength: 1000 }),
            }),
          }
        )
        .put(
          "/:id",
          (ctx: Context) => updatePost(ctx.params.id, ctx.body, ctx.user!),
          {
            auth: true, 
            params: t.Object({ id: t.String() }),
            body: t.Object({
              title: t.Optional(t.String({ minLength: 3 })),
              content: t.Optional(t.String({ minLength: 3 })),
            }),
          }
        )
        .delete(
          "/:id",
          (ctx: Context) => deletePost(ctx.params.id, ctx.user!),
          {
            auth: true, 
            params: t.Object({ id: t.String() }),
          }
        )
    );
