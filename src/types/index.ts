export interface Post {
  id: number;
  title: string;
  content: string;
    userId: string;
}

export interface User {
  id: string;
  email: string;
  role: "admin" | "user";
}

export type Role = "admin" | "user";
