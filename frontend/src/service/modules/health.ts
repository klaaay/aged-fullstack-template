import { apiClient } from '../core/client'

type HealthResponse = {
  status: string
  service: string
}

export async function getHealthStatus() {
  const response = await apiClient.get<HealthResponse>('/health')
  return response.data
}
