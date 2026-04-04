import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('./lib/api', () => ({
  getHealth: vi.fn().mockResolvedValue({
    status: 'ok',
    service: 'aged-fullstack-template'
  })
}))

import App from './App'

describe('App', () => {
  it('渲染模板标题和健康状态区域', async () => {
    render(<App />)

    expect(screen.getByText('aged-fullstack-template')).toBeTruthy()
    expect(await screen.findByText(/服务状态/i)).toBeTruthy()
  })
})
