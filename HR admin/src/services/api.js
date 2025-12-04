const HOSTED_FRONTEND = 'hr.defitex2.0.org';
const HOSTED_API_BASE = 'https://api-hr.defitex2.0.org/api';

const resolveApiBaseUrl = () => {
  if (import.meta.env?.VITE_HR_API_BASE) {
    return import.meta.env.VITE_HR_API_BASE;
  }
  if (typeof window !== 'undefined' && window.location.hostname === HOSTED_FRONTEND) {
    return HOSTED_API_BASE;
  }
  return '/api';
};

const API_BASE_URL = resolveApiBaseUrl();

async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorMessage = 'API request failed';
      try {
        const data = await response.json();
        errorMessage = data.error || data.message || errorMessage;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Please make sure the backend server is running.');
    }
    throw error;
  }
}

export const esicAPI = {
  getAll: () => fetchAPI('/esic'),
  getById: (id) => fetchAPI(`/esic/${id}`),
  create: (data) => fetchAPI('/esic', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/esic/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/esic/${id}`, {
    method: 'DELETE',
  }),
};

export const pfAPI = {
  getAll: () => fetchAPI('/pf'),
  getById: (id) => fetchAPI(`/pf/${id}`),
  create: (data) => fetchAPI('/pf', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/pf/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/pf/${id}`, {
    method: 'DELETE',
  }),
};

export const tdsAPI = {
  getAll: () => fetchAPI('/tds'),
  getById: (id) => fetchAPI(`/tds/${id}`),
  create: (data) => fetchAPI('/tds', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/tds/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/tds/${id}`, {
    method: 'DELETE',
  }),
};

export const medicalInsuranceAPI = {
  getAll: () => fetchAPI('/medical-insurance'),
  getById: (id) => fetchAPI(`/medical-insurance/${id}`),
  create: (data) => fetchAPI('/medical-insurance', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/medical-insurance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/medical-insurance/${id}`, {
    method: 'DELETE',
  }),
};

export const interiorPayrollAPI = {
  getAll: (params) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI(`/interior-payroll${queryString}`);
  },
  getById: (id) => fetchAPI(`/interior-payroll/${id}`),
  create: (data) => fetchAPI('/interior-payroll', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/interior-payroll/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/interior-payroll/${id}`, {
    method: 'DELETE',
  }),
};

export const vendorsAPI = {
  getAll: () => fetchAPI('/vendors'),
  getById: (id) => fetchAPI(`/vendors/${id}`),
  create: (data) => fetchAPI('/vendors', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/vendors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/vendors/${id}`, {
    method: 'DELETE',
  }),
};

export const utilitiesAPI = {
  getAll: () => fetchAPI('/utilities'),
  getById: (id) => fetchAPI(`/utilities/${id}`),
  create: (data) => fetchAPI('/utilities', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/utilities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/utilities/${id}`, {
    method: 'DELETE',
  }),
};

export const dashboardAPI = {
  getStats: () => fetchAPI('/dashboard/stats'),
};

export const ticketsAPI = {
  getAll: (params) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI(`/tickets${queryString}`);
  },
  getById: (id) => fetchAPI(`/tickets/${id}`),
  create: (data) => fetchAPI('/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/tickets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/tickets/${id}`, {
    method: 'DELETE',
  }),
  close: (id, data) => fetchAPI(`/tickets/${id}/close`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  resolve: (id, data) => fetchAPI(`/tickets/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

