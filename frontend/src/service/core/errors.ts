import { AxiosError } from 'axios'

export type ApiError = {
  type: string
  message: string
  status: number | null
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    'status' in error
  )
}

export function normalizeApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error
  }

  if (error instanceof AxiosError) {
    const payload = error.response?.data as
      | { error?: { type?: string; message?: string } }
      | undefined

    return {
      type: payload?.error?.type ?? 'network_error',
      message: payload?.error?.message ?? error.message,
      status: error.response?.status ?? null
    }
  }

  if (error instanceof Error) {
    return {
      type: 'unknown_error',
      message: error.message,
      status: null
    }
  }

  return {
    type: 'unknown_error',
    message: 'unknown error',
    status: null
  }
}

export function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'unknown error'
}
