import { Elysia } from "elysia";
import { getAllUsers } from "../handlers/userHandler";
import { requireAdmin } from "../middlewares/requireAdmin";

export const userRoutes = (app: Elysia) =>
  app.group("/users", (group) =>
    group.use(requireAdmin).get("/", async () => await getAllUsers())
  );
