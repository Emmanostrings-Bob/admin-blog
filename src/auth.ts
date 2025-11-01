import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin, openAPI } from "better-auth/plugins"; // ✅ add openAPI plugin
import { Elysia, t } from "elysia";
import dotenv from "dotenv";
import User from "./models/User";
import connectDB from "./db";

dotenv.config();
await connectDB();

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db();
const usersCollection = db.collection("users");

export const auth = betterAuth({
  secret: process.env.AUTH_SECRET!,
  basePath: "/api",
  database: mongodbAdapter(db, { client }),
  emailAndPassword: { enabled: true },

  user: {
    additionalFields: {
      role: { type: "string", default: "user" },
    },
    select: ["id", "email", "role", "emailVerified", "createdAt", "updatedAt"],
  },

  transformUser: async (user: any) => {
    if (!user) return user;

    const isAdmin = user.email?.toLowerCase() === "admin@blog.com";
    const role = isAdmin ? "admin" : user.role || "user";

    await usersCollection.updateOne(
      { _id: user.id },
      { $set: { role } },
      { upsert: true }
    );

    await User.findOneAndUpdate(
      { _id: user.id },
      { email: user.email, role },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return { ...user, role };
  },

  sessionData: async ({ user }: { user: any }) => ({
    role: user.role || "user",
  }),

  plugins: [
    admin({
      defaultRole: "user",
      adminRole: "admin",
      adminUserIds: [],
      enableAdminApi: true,
    }),
    openAPI(),
  ],

  events: {
    async userCreated({ user }: { user: { id: string; email: string } }) {
      try {
        const isAdmin = user.email?.toLowerCase() === "admin@blog.com";
        const role = isAdmin ? "admin" : "user";

        await usersCollection.updateOne(
          { _id: user.id as any },
          { $set: { role } },
          { upsert: true }
        );

        await User.findOneAndUpdate(
          { _id: user.id },
          { email: user.email, role },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log(`✅ Role set to "${role}" for ${user.email}`);
      } catch (err) {
        console.error("❌ userCreated event error:", err);
      }
    },

    async afterRegister({ user, response }: any) {
      const isAdmin = user.email?.toLowerCase() === "admin@blog.com";
      const role = isAdmin ? "admin" : "user";
      response.user = { ...response.user, role };
      console.log(`🎯 Role "${role}" included in signup response`);
    },
  },
});

export const betterAuthPlugin = new Elysia({ name: "better-auth" })
  .mount("/auth", auth.handler)
  .macro({
    auth: {
      schema: {
        headers: t.Object({
          authorization: t.Optional(t.String()),
        }),
      },
      async resolve({ set, request: { headers } }) {
        const session = await auth.api.getSession({ headers });

        if (!session) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        set.status = 200;
        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });
