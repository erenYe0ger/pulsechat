import api from "./axios";
import type { User } from "../types/auth";

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>("/users/me");
  return response.data;
}

export async function updateProfile(name: string): Promise<User> {
  const response = await api.patch<User>("/users/me", { name });
  return response.data;
}

export async function searchUsers(query: string): Promise<User[]> {
  const response = await api.get<User[]>("/users/search", {
    params: { q: query },
  });
  return response.data;
}
