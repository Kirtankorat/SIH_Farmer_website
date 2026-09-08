/* ========================================================
   HARVESTLINK — api.js
   Frontend API Client for FastAPI + PostgreSQL Backend
   ======================================================== */

const API_BASE_URL = 'http://localhost:8000/api';
const HL_TOKEN_KEY = 'hl_token';

const api = {
  getToken() {
    return localStorage.getItem(HL_TOKEN_KEY) || null;
  },

  setToken(token) {
    if (token) localStorage.setItem(HL_TOKEN_KEY, token);
    else localStorage.removeItem(HL_TOKEN_KEY);
  },

  getHeaders(isJson = true) {
    const headers = {};
    if (isJson) headers['Content-Type'] = 'application/json';
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const opts = {
      ...options,
      headers: {
        ...this.getHeaders(!(options.body instanceof FormData)),
        ...(options.headers || {})
      }
    };

    try {
      const res = await fetch(url, opts);
      if (!res.ok) {
        let errDetail = 'Request failed';
        try {
          const errJson = await res.json();
          errDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
        } catch (_) {
          errDetail = `HTTP error ${res.status}: ${res.statusText}`;
        }
        throw new Error(errDetail);
      }
      if (res.status === 204) return null;
      return await res.json();
    } catch (err) {
      console.warn(`[HarvestLink API] Request to ${endpoint} failed:`, err.message);
      throw err;
    }
  },

  // --- AUTHENTICATION ---
  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (data.access_token) this.setToken(data.access_token);
    return data;
  },

  async demoLogin(role) {
    const data = await this.request('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
    if (data.access_token) this.setToken(data.access_token);
    return data;
  },

  async register(payload) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (data.access_token) this.setToken(data.access_token);
    return data;
  },

  async getMe() {
    return await this.request('/auth/me');
  },

  // --- PRODUCTS ---
  async getProducts(params = {}) {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.category && params.category !== 'all') q.append('category', params.category);
    if (params.practice && params.practice !== 'all') q.append('practice', params.practice);
    if (params.seller_type && params.seller_type !== 'all') q.append('seller_type', params.seller_type);
    if (params.max_price) q.append('max_price', params.max_price);
    if (params.sort) q.append('sort', params.sort);
    
    const qs = q.toString() ? `?${q.toString()}` : '';
    return await this.request(`/products${qs}`);
  },

  async getProduct(id) {
    return await this.request(`/products/${id}`);
  },

  async getRelatedProducts(id, limit = 4) {
    return await this.request(`/products/${id}/related?limit=${limit}`);
  },

  async createProduct(productData) {
    return await this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  async updateProduct(id, productData) {
    return await this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  async deleteProduct(id) {
    return await this.request(`/products/${id}`, { method: 'DELETE' });
  },

  // --- ORDERS & TRACKING ---
  async createOrder(orderData) {
    return await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  async getOrder(orderNumOrId) {
    return await this.request(`/orders/${orderNumOrId}`);
  },

  async getOrders() {
    return await this.request('/orders');
  },

  async updateOrderStatus(orderId, status) {
    return await this.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // --- BULK REQUESTS ---
  async createBulkRequest(reqData) {
    return await this.request('/bulk-requests', {
      method: 'POST',
      body: JSON.stringify(reqData)
    });
  },

  async getBulkRequests() {
    return await this.request('/bulk-requests');
  },

  // --- DASHBOARDS ---
  async getFarmerDashboard() {
    return await this.request('/dashboards/farmer');
  },

  async getFPODashboard() {
    return await this.request('/dashboards/fpo');
  },

  async getBulkDashboard() {
    return await this.request('/dashboards/bulk');
  },

  async getLogisticsDashboard() {
    return await this.request('/dashboards/logistics');
  },

  // --- DEMAND INSIGHTS ---
  async getDemand(cropKey = '') {
    return await this.request(cropKey ? `/demand/${cropKey}` : '/demand');
  },

  // --- FARMERS DIRECTORY ---
  async getFarmers(params = {}) {
    const q = new URLSearchParams();
    if (params.practice && params.practice !== 'all') q.append('practice', params.practice);
    if (params.role && params.role !== 'all') q.append('role', params.role);
    if (params.search) q.append('search', params.search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return await this.request(`/farmers${qs}`);
  },

  // --- LOGISTICS ---
  async getShipments() {
    return await this.request('/logistics/shipments');
  },

  async getRoutes() {
    return await this.request('/logistics/routes');
  },

  // --- CONTACT ---
  async submitContact(contactData) {
    return await this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
  }
};

window.api = api;
