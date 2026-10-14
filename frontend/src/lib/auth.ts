export function saveToken(token: string) {
  localStorage.setItem("token", token);
}

export function saveFullName(name: string) {
  localStorage.setItem("fullName", name);
}

export function getFullName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fullName");
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function clearToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("fullName");
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function getEmail(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}
