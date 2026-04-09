import { apiBaseUrl } from '../../lib/env'

export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`)

  if (!response.ok) {
    throw new Error(`request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}
