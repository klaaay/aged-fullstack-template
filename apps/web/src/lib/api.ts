import { apiBaseUrl } from './env'

type HealthResponse = {
  status: string
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${apiBaseUrl}/health`)

  if (!response.ok) {
    throw new Error(`health request failed: ${response.status}`)
  }

  return response.json() as Promise<HealthResponse>
}
