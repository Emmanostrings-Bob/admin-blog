import { Elysia, t } from "elysia";
import { getPost, getPosts } from "../handlers/postHandler";

export const postRoutes = (app: Elysia) =>
  app.group("/posts", (group) =>
    group
      .get("/", () => getPosts())
      .get("/:id", ({ params: { id } }) => getPost(id), {
        params: t.Object({ id: t.String() }),
      })
  );
