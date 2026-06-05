import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const conversationService = {
  create: (data: { displayName: string; anonymous: boolean }) => api.post('/conversations', data),
  get: (roomId: string) => api.get(`/conversations/${roomId}`),
  getAll: (status?: string) => api.get('/conversations', { params: { status } }),
  updateStatus: (roomId: string, status: string) => api.patch(`/conversations/${roomId}/status`, { status }),
  getStats: () => api.get('/conversations/stats'),
}

export const messageService = {
  getMessages: (roomId: string, page = 1) => api.get(`/messages/${roomId}`, { params: { page } }),
  uploadImage: (formData: FormData) => api.post('/messages/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteMessage: (messageId: string) => api.delete(`/messages/${messageId}`),
  markAsRead: (roomId: string) => api.patch(`/messages/${roomId}/read`),
}

export default api
