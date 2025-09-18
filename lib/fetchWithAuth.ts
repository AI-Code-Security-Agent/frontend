
import Cookies from 'js-cookie';

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  timeout = 30000 
): Promise<Response> {
  const token = Cookies.get("accessToken");

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}
