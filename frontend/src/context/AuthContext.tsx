import {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from "react";

import api from "../api/axios";
import { getCurrentUser } from "../api/users";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "../types/auth";

interface AuthContextValue {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredUser(): User | null {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  async function login(email: string, password: string): Promise<void> {
    const payload: LoginPayload = { email, password };
    const response = await api.post<AuthResponse>("/auth/login", payload);

    localStorage.setItem("token", response.data.access_token);
    setToken(response.data.access_token);

    const currentUser = await getCurrentUser();
    localStorage.setItem("user", JSON.stringify(currentUser));
    setUser(currentUser);
  }

  async function register(
    name: string,
    email: string,
    password: string
  ): Promise<void> {
    const payload: RegisterPayload = { name, email, password };
    await api.post<User>("/auth/register", payload);
  }

  function logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
