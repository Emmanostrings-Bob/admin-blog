import { Elysia } from "elysia";
import swagger from "@elysiajs/swagger";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { betterAuthPlugin } from "./auth";

import { postRoutes } from "./routes/post.routes";
import { userPostRoutes } from "./routes/user.post.routes";
import { requireAuth } from "./middlewares/requireAuth";
import { userRoutes } from "./routes/user.route";
import { adminRoutes } from "./routes/admin.route";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI as string;
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected successfully");

    const app = new Elysia()
      .use(swagger())
      .use(betterAuthPlugin)
      .use(requireAuth)
      .get("/profile", ({ user }) => user)
      .use(userRoutes)
      .use(userPostRoutes)
      .use(postRoutes)
      .use(adminRoutes)
      .get("/", () => "Welcome to this Blog API")
      .get("/user", ({ user, session }) => ({ user, session }), { auth: true })
      .listen(PORT);

    console.log(`🦊 Elysia running at http://${app.server?.hostname}:${app.server?.port}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

startServer();
