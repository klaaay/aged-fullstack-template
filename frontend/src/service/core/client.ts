import axios from 'axios'

import { installInterceptors } from './interceptors'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true
})

installInterceptors(apiClient)
