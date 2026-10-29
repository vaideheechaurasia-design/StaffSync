import axios from 'axios';

// Resolve the base API URL from environment variables, preferring VITE_API_URL and falling back to VITE_API_BASE_URL or local development
const rawBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api/v1';

// Normalize: trim whitespace and strip any trailing slashes
let cleanBaseUrl = (rawBaseUrl || '').trim().replace(/\/+$/, '');

// Ensure the endpoint resolves to canonical /api/v1
if (cleanBaseUrl.endsWith('/api/v1')) {
  // Already has full /api/v1 prefix, keep as-is
} else if (cleanBaseUrl.endsWith('/api')) {
  // Has /api prefix but missing /v1 version
  cleanBaseUrl = `${cleanBaseUrl}/v1`;
} else {
  // Raw hostname without API prefix, append /api/v1
  cleanBaseUrl = `${cleanBaseUrl}/api/v1`;
}

const apiClient = axios.create({
  baseURL: cleanBaseUrl,
  withCredentials: true, // Mandatory for cross-site HTTP-only JWT cookies
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000 // 15 second timeout to accommodate cold starts on free cloud hosting
});

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorPayload = error.response?.data || {
      success: false,
      statusCode: error.response?.status || 500,
      message: error.message || 'Network connection failed.'
    };
    return Promise.reject(errorPayload);
  }
);

export default apiClient;
