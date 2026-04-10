import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios')

  return {
    ...actual,
    default: {
      create: vi.fn(() => ({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }))
    }
  }
})

describe('createApiClient', () => {
  afterEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('使用 VITE_API_BASE_URL 创建 axios client 并注册拦截器', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '/api')

    const { apiClient } = await import('./client')
    const axios = (await import('axios')).default

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: '/api',
      timeout: 10000,
      withCredentials: true
    })
    expect(apiClient.interceptors.request.use).toHaveBeenCalledTimes(1)
    expect(apiClient.interceptors.response.use).toHaveBeenCalledTimes(1)
  })
})
