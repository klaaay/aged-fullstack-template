import { apiClient } from '../core/client'

export type User = {
  id: string
  email: string
  role: 'user' | 'admin'
}

type AuthResult = {
  access_token: string
  user: User
}

type AdminEntry = {
  message: string
}

export async function registerWithEmail(email: string, password: string) {
  const response = await apiClient.post<User>('/auth/register', { email, password })
  return response.data
}

export async function loginWithEmail(email: string, password: string) {
  const response = await apiClient.post<AuthResult>('/auth/login', { email, password })
  return response.data
}

export async function refreshAuthSession() {
  const response = await apiClient.post<AuthResult>('/auth/refresh')
  return response.data
}

export async function logoutAuthSession() {
  await apiClient.post('/auth/logout')
}

export async function getAdminEntry(accessToken: string) {
  const response = await apiClient.get<AdminEntry>('/auth/admin-entry', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  return response.data
}
