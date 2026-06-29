import axios from "axios";
import { useAuthStore } from "@/store/authStore";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403 || status === 404) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth ---
export const authAPI = {
  register: (data: { email: string; username: string; password: string; full_name?: string; role?: string }) =>
    api.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  me: () => api.get("/users/me"),
};

// --- Projects ---
export const projectsAPI = {
  list: (params?: { status?: string }) =>
    api.get("/projects", { params }),

  myProjects: () => api.get("/projects/my"),

  get: (id: number) => api.get(`/projects/${id}`),

  create: (data: {
    title: string;
    description?: string;
    budget_min?: number;
    budget_max?: number;
    skills_required?: string[];
    deadline?: string;
  }) => api.post("/projects", data),

  update: (id: number, data: object) =>
    api.patch(`/projects/${id}`, data),

  getMilestones: (id: number) =>
    api.get(`/projects/${id}/milestones`),

  createMilestone: (id: number, data: { title: string; amount: number; description?: string }) =>
    api.post(`/projects/${id}/milestones`, data),

  getMessages: (id: number) =>
    api.get(`/projects/${id}/messages`),

  sendMessage: (id: number, content: string) =>
    api.post(`/projects/${id}/messages`, { content }),
};

// --- AI ---
export const aiAPI = {
  generateBlueprint: (data: {
    project_title: string;
    project_description: string;
    budget?: number;
    deadline_days?: number;
  }) => api.post("/ai/planner", data),

  analyzeTrust: (userId: number) =>
    api.post(`/ai/trust/${userId}`),

  analyzeVideo: (description: string) =>
    api.post("/ai/video/analyze", { description }),
};

// --- Skills ---
export const skillsAPI = {
  getQuestions: (skill: string) =>
    api.get(`/skills/${skill}/questions`),

  submitTest: (data: { skill_name: string; answers: Record<string, number> }) =>
    api.post("/skills/submit", data),

  myResults: () => api.get("/skills/my-results"),
};

// --- Wallet ---
export const walletAPI = {
  getWallet: () => api.get("/wallet/me"),
};

// --- Payments (Stripe) ---
export const paymentAPI = {
  createSession: (amount: number, projectId?: number) => 
    api.post("/payments/create-session", { amount, project_id: projectId }),
  
  createConnectAccount: () => 
    api.post("/payments/connect-onboarding"),
};

// --- Trust ---
export const trustAPI = {
  getScore: () => api.get("/trust/score"),
};

// --- Users ---
export const usersAPI = {
  getProfile: (id: number) => api.get(`/users/${id}`),
  updateProfile: (data: object) => api.patch("/users/me", data),
  verifyPhone: (phone_number: string) => api.post("/users/verify-phone", { phone_number }),
  uploadMedia: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/users/upload-media", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadVerification: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/uploads/verification", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default api;
