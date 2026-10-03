const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('rhizan_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }

    // If unauthorized or token invalid (e.g., user deleted or session expired)
    // Avoid triggering logout when intentionally trying to log in with bad password
    if ((response.status === 401 || response.status === 403) && !endpoint.includes('/auth/login')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('rhizan_token');
        localStorage.removeItem('rhizan_user');
        window.dispatchEvent(new CustomEvent('rhizan_auth_invalidated', { detail: { message: errorMessage } }));
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = `/login?error=${encodeURIComponent(errorMessage || 'Session terminated')}`;
        }
      }
    }

    throw new Error(errorMessage);
  }

  return response.json();
}
