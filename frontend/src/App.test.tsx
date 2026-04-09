import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('./service', () => ({
  getExampleItems: vi.fn().mockResolvedValue([
    { id: 'hello', label: 'Hello template' },
    { id: 'customize', label: 'Customize me' }
  ]),
  getHealthStatus: vi.fn().mockResolvedValue({
    status: 'ok',
    service: 'aged-fullstack-template'
  })
}))

import App from './App'

describe('App', () => {
  it('通过布局和 example 页面渲染模板结构', async () => {
    render(<App />)

    expect(screen.getByText('aged-fullstack-template')).toBeTruthy()
    expect(await screen.findByText('Example Page')).toBeTruthy()
    expect(await screen.findByText('Hello template')).toBeTruthy()
    expect(screen.getByText('服务状态')).toBeTruthy()
  })
})
