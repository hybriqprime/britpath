const BASE = import.meta.env.VITE_API_URL || '';

export async function api(path, { method = 'GET', body, token } = {}) {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: {
      ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // empty or non-JSON response
  }

  if (!res.ok) {
    const err = new Error(data?.message || 'Something went wrong. Please try again.');
    err.status = res.status;
    throw err;
  }
  return data;
}