import { describe, expect, it, vi } from 'vitest'

vi.mock('../core/client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({
      data: {
        items: [
          { id: 'hello', label: 'Hello template' },
          { id: 'customize', label: 'Customize me' }
        ]
      }
    })
  }
}))

import { getExampleItems } from './example'

describe('getExampleItems', () => {
  it('从 example 模块返回列表数据', async () => {
    const result = await getExampleItems()

    expect(result).toEqual([
      { id: 'hello', label: 'Hello template' },
      { id: 'customize', label: 'Customize me' }
    ])
  })
})
