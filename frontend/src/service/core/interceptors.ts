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
    (response) => response,
    (error: unknown) => Promise.reject(normalizeApiError(error))
  )
}
