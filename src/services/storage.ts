import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Book, User } from "../types";

const BOOKS_KEY = "books";
const USERS_KEY = "users";
const SESSION_KEY = "currentUser";

export const MAIN_ADMIN: User = {
  id: "main-admin",
  username: "admin",
  password: "123",
  role: "admin",
};

export async function getBooks(): Promise<Book[]> {
  const raw = await AsyncStorage.getItem(BOOKS_KEY);
  if (!raw) return [];

  const parsed = JSON.parse(raw) as Array<Partial<Book>>;

  // Підтримка старих книг, у яких ще не було id.
  const normalized: Book[] = parsed.map((book, index) => ({
    id: book.id ?? `${Date.now()}-${index}`,
    title: book.title ?? "",
    author: book.author ?? "",
  }));

  await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(normalized));
  return normalized;
}

export async function saveBooks(books: Book[]): Promise<void> {
  await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

export async function getUsers(): Promise<User[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as User[]) : [];
}

export async function registerViewer(
  username: string,
  password: string
): Promise<User[]> {
  const users = await getUsers();

  if (
    username === MAIN_ADMIN.username ||
    users.some((user) => user.username === username)
  ) {
    throw new Error("Користувач з таким логіном вже існує");
  }

  const newUser: User = {
    id: Date.now().toString(),
    username,
    password,
    role: "viewer",
  };

  const updatedUsers = [...users, newUser];
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  return updatedUsers;
}

export async function login(
  username: string,
  password: string
): Promise<User | null> {
  if (username === MAIN_ADMIN.username && password === MAIN_ADMIN.password) {
    await saveSession(MAIN_ADMIN);
    return MAIN_ADMIN;
  }

  const users = await getUsers();
  const foundUser = users.find(
    (user) => user.username === username && user.password === password
  );

  if (!foundUser) return null;

  await saveSession(foundUser);
  return foundUser;
}

export async function saveSession(user: User): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export async function getSession(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
