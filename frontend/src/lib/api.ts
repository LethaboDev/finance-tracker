const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; fullName: string; email: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (fullName: string, email: string, password: string) =>
      request<{ token: string; fullName: string; email: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ fullName, email, password }),
      }),
  },
  transactions: {
    getAll: () => request<Transaction[]>("/transactions"),
    getBalance: () => request<number>("/transactions/balance"),
    create: (data: CreateTransaction) =>
      request<Transaction>("/transactions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/transactions/${id}`, { method: "DELETE" }),
  },
  admin: {
    getUsers: () => request<User[]>("/admin/users"),
    getTransactions: () => request<Transaction[]>("/admin/transactions"),
    getStats: () => request<AdminStats>("/admin/stats"),
    deleteUser: (id: number) =>
      request<void>(`/admin/users/${id}`, { method: "DELETE" }),
  },
};

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  date?: string;
  createdAt?: unknown;
}

export interface CreateTransaction {
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  date: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  transactionCount?: number;
}

export interface AdminStats {
  totalUsers: number;
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
}
