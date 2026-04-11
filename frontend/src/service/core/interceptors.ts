import { AxiosHeaders, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

import { normalizeApiError } from './errors'

function attachDefaultHeaders(config: InternalAxiosRequestConfig) {
  const headers = AxiosHeaders.from(config.headers)
  headers.set('Accept', 'application/json')
  config.headers = headers

  return config
}

export function installInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => attachDefaultHeaders(config))
  client.interceptors.response.use(
    (response) => {
      // 统一拆包 { data: <payload> } 信封，使 service 层直接拿到业务数据
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        response.data = response.data.data
      }
      return response
    },
    (error: unknown) => Promise.reject(normalizeApiError(error))
  )
}
