import { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'

import { normalizeApiError } from './errors'

describe('normalizeApiError', () => {
  it('对已经归一化的错误保持原样返回', () => {
    expect(
      normalizeApiError({
        type: 'internal_error',
        message: 'internal server error',
        status: 500
      })
    ).toEqual({
      type: 'internal_error',
      message: 'internal server error',
      status: 500
    })
  })

  it('把后端错误结构转换成统一错误对象', () => {
    const error = new AxiosError('Request failed with status code 500')
    error.response = {
      data: {
        error: {
          type: 'internal_error',
          message: 'internal server error'
        }
      },
      status: 500,
      statusText: 'Internal Server Error',
      headers: {},
      config: {} as never
    }

    expect(normalizeApiError(error)).toEqual({
      type: 'internal_error',
      message: 'internal server error',
      status: 500
    })
  })
})
