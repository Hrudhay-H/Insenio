const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiConfig = {
  baseUrl: API_BASE_URL,
};

async function handleResponse(response) {
  if (!response.ok) {
    if (response.status === 401) {
      // Clear token and potentially redirect to login if we had global router access
      localStorage.removeItem('access_token');
      localStorage.removeItem('role');
      localStorage.removeItem('user_id');
      throw new Error('Unauthorized - please log in again');
    }
    if (response.status === 403) {
      throw new Error('Forbidden - you do not have permission to access this resource');
    }
    if (response.status === 409) {
      throw new Error('Conflict - this action has already been performed or contradicts existing state');
    }
    const errText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errText}`);
  }

  // Some endpoints might return empty response
  if (response.status === 204) return null;

  return response.json();
}

export async function apiRequest(path, options = {}) {
  if (!apiConfig.baseUrl) throw new Error('API base URL is not configured');

  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${apiConfig.baseUrl}${path}`, {
    ...options,
    headers,
  });

  return handleResponse(response);
}

// For multipart/form-data uploads — deliberately does NOT set Content-Type,
// since the browser needs to add its own multipart boundary automatically.
export async function apiUpload(path, formData) {
  if (!apiConfig.baseUrl) throw new Error('API base URL is not configured');

  const token = localStorage.getItem('access_token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${apiConfig.baseUrl}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  return handleResponse(response);
}
