export type UserRole = "admin" | "viewer";

export type User = {
  id: string;
  username: string;
  password: string;
  role: UserRole;
};

export type Book = {
  id: string;
  title: string;
  author: string;
};
