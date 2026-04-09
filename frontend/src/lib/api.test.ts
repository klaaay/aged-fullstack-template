import { describe, expect, it, vi } from 'vitest'
import { getHealth } from './api'

describe('getHealth', () => {
  it('请求 health 接口并返回 JSON', async () => {
    const json = vi.fn().mockResolvedValue({ status: 'ok' })

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json
      })
    )

    const result = await getHealth()

    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:3000/api/health')
    expect(result).toEqual({ status: 'ok' })
  })
})
