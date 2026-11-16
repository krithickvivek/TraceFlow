/**
 * @file api.js
 * @description Axios instance configured with base URL, credentials, and
 *              interceptors. Exports typed API functions for auth, progress,
 *              and algorithms endpoints.
 * @module services/api
 */

import axios from 'axios';

/** Base URL for all API requests — uses env var or defaults to localhost. */
const BASE_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:4000');

/** Configured Axios instance. */
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

/* Response interceptor: on 401, redirect to login (handled by AuthContext). */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    /* Let callers handle 401 themselves — AuthContext listens for this. */
    return Promise.reject(error);
  }
);

/* ── Auth API ── */

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: object }>}
 */
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }).then(r => r.data),
  register: (name, email, password, extras = {}) => api.post('/api/auth/register', { name, email, password, ...extras }).then(r => r.data),
  logout: () => api.post('/api/auth/logout').then(r => r.data),
  me: () => api.get('/api/auth/me').then(r => r.data)
};

/* ── Progress API ── */

export const progressAPI = {
  getAll: () => api.get('/api/progress').then(r => r.data),
  save: (algorithmSlug, stepsExplored) =>
    api.post('/api/progress', { algorithmSlug, stepsExplored }).then(r => r.data)
};

/* ── Algorithms API ── */

export const algorithmsAPI = {
  list: () => api.get('/api/algorithms').then(r => r.data)
};

/* ── Saved Visualizations API ── */

export const savedAPI = {
  getAll: () => api.get('/api/auth/saved').then(r => r.data),
  save: (data) => api.post('/api/auth/saved', data).then(r => r.data),
  update: (id, data) => api.put(`/api/auth/saved/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/api/auth/saved/${id}`).then(r => r.data),
};

/* ── Quiz API ── */

export const quizAPI = {
  saveScore: (data) => api.post('/api/auth/quiz', data).then(r => r.data),
  getAll: () => api.get('/api/auth/quiz').then(r => r.data),
  getBySlug: (slug) => api.get(`/api/auth/quiz/${slug}`).then(r => r.data),
  getStats: () => api.get('/api/auth/quiz-stats').then(r => r.data),
  deleteBySlug: (slug) => api.delete(`/api/auth/quiz/${slug}`).then(r => r.data),
  deleteAll: () => api.delete('/api/auth/quiz').then(r => r.data),
};

export default api;
