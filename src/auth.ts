// import { betterAuth } from "better-auth";
// import { MongoClient } from "mongodb";
// import { mongodbAdapter } from "better-auth/adapters/mongodb";
// import { Elysia, t } from "elysia";
// import dotenv from "dotenv";
// import User from "./models/User";
// import connectDB from "./db";

// dotenv.config();

// // ✅ Connect Mongoose
// await connectDB();

// // ✅ Initialize direct MongoDB client for Better Auth internal DB
// const client = new MongoClient(process.env.MONGODB_URI!);
// const db = client.db("betterauth");

// export const auth = betterAuth({
//   secret: process.env.AUTH_SECRET!,
//   basePath: "/api",

//   database: mongodbAdapter(db, { client }),

//   emailAndPassword: { enabled: true },

//   user: {
//     additionalFields: {
//       role: { type: "string", default: "user" },
//     },
//     select: ["id", "email", "role", "emailVerified", "createdAt", "updatedAt"],
//   },

//   events: {
//     async userCreated({ user }: { user: { id: string; email: string } }) {
//       try {
//         // Assign role
//         const role: "admin" | "user" =
//           user.email === "admin@blog.com" ? "admin" : "user";

//         // ✅ Sync with your Mongoose User collection
//         await User.findOneAndUpdate(
//           { _id: user.id },
//           { _id: user.id, email: user.email, role },
//           { upsert: true, new: true, setDefaultsOnInsert: true }
//         );

//         // ✅ Update the correct Better Auth user collection
//         const usersCollection = db.collection<{ _id: string; role?: string }>(
//           "betterauth.users"
//         );

//         await usersCollection.updateOne(
//           { _id: user.id as any },
//           { $set: { role } }
//         );

//         console.log(`✅ User created and synced with role: ${role}`);
//       } catch (err) {
//         console.error("❌ userCreated event error:", err);
//       }
//     },
//   },
// });

// // ✅ Elysia plugin with validation
// export const betterAuthPlugin = new Elysia({ name: "better-auth" })
//   .mount("/auth", auth.handler)
//   .macro({
//     auth: {
//       // ✅ Add input validation (using Elysia's t)
//       schema: {
//         headers: t.Object({
//           authorization: t.Optional(t.String()),
//         }),
//       },
//       async resolve({ set, request: { headers } }) {
//         const session = await auth.api.getSession({ headers });

//         if (!session) {
//           set.status = 401;
//           return { error: "Unauthorized" };
//         }

//         return {
//           user: {
//             id: session.user.id,
//             email: session.user.email,
//             role: (session.user.role as "admin" | "user") || "user",
//           },
//           session: session.session,
//         };
//       },
//     },
//   });


import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { Elysia, t } from "elysia";
import dotenv from "dotenv";
import User from "./models/User";
import connectDB from "./db";

dotenv.config();

await connectDB();

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("betterauth");

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

  sessionData: async ({ user }: { user: any }) => ({
    role: user.role || "user",
  }),

  transformUser: async (user: any) => ({
    ...user,
    role: user.role || "user",
  }),

  events: {
    async userCreated({ user }: { user: { id: string; email: string } }) {
      try {
        const role: "admin" | "user" =
          user.email === "admin@blog.com" ? "admin" : "user";

        await User.findOneAndUpdate(
          { _id: user.id },
          { _id: user.id, email: user.email, role },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        const usersCollection = db.collection("users");
        await usersCollection.updateOne(
          { _id: user.id as any },
          { $set: { role } }
        );

        console.log(`✅ User created and synced with role: ${role}`);
      } catch (err) {
        console.error("❌ userCreated event error:", err);
      }
    },
  },
});

// ✅ Elysia integration + validation
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

        // ✅ role now included in session.user
        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });
