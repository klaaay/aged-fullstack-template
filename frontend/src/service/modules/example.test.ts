import { describe, expect, it, vi } from 'vitest'
import { getExampleItems } from './example'

vi.mock('../core/client', () => ({
  getJson: vi.fn().mockResolvedValue({
    items: [
      { id: 'hello', label: 'Hello template' },
      { id: 'customize', label: 'Customize me' }
    ]
  })
}))

describe('getExampleItems', () => {
  it('从 example 模块返回列表数据', async () => {
    const result = await getExampleItems()

    expect(result).toEqual([
      { id: 'hello', label: 'Hello template' },
      { id: 'customize', label: 'Customize me' }
    ])
  })
})
