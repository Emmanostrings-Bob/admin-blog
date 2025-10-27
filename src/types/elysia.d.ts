import "elysia";

declare module "elysia" {
  interface Context {
    user?: {
      id: string;
      email: string;
      role: "admin" | "user";
    };
    session?: any;
    [x: string]: any;
  }
}
