import { getJson } from '../core/client'

type HealthResponse = {
  status: string
  service: string
}

export async function getHealthStatus() {
  return getJson<HealthResponse>('/health')
}
