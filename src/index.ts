import { Elysia } from "elysia";
import swagger from "@elysiajs/swagger";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { betterAuthPlugin, auth } from "./auth";

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
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected successfully");

    // 🧩 Generate the OpenAPI schema from BetterAuth
    const betterAuthSchema = await auth.api.generateOpenAPISchema();

    // ✅ Prefix BetterAuth paths with `/auth/api`
    const rawPaths = (betterAuthSchema as any)?.paths ?? {};
    const prefixedPaths: Record<string, any> = {};

    for (const [path, schema] of Object.entries(rawPaths)) {
      prefixedPaths[`/auth/api${path}`] = schema;
    }

    const components = (betterAuthSchema as any)?.components ?? {};

    // ✅ Type-safe components with security scheme
    const safeComponents = {
      schemas: (components as any).schemas ?? {},
      securitySchemes: {
        bearerAuth: {
          type: "http" as const,
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter your access token here (without 'Bearer ' prefix)",
        },
      },
    };

    const app = new Elysia()
      .use(betterAuthPlugin)
      .use(
        swagger({
          documentation: {
            info: {
              title: "Blog API + BetterAuth",
              version: "1.0.0",
              description:
                "Unified API documentation for Blog routes and BetterAuth endpoints.",
            },
            paths: prefixedPaths as any,
            components: safeComponents,
          },
        })
      )
      .get("/", () => "Welcome to this Blog API")
      .use(requireAuth)
      .use(userRoutes)
      .use(userPostRoutes)
      .use(postRoutes)
      .use(adminRoutes)
      .get(
        "/user",
        ({ user, session }) => ({ user, session }),
        { auth: true }
      )
      .listen(PORT);

    console.log(
      `🦊 Elysia running at http://${app.server?.hostname}:${app.server?.port}`
    );
    console.log(`📘 Swagger available at http://localhost:${PORT}/swagger`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

startServer();
