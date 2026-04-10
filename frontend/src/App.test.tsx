import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('./service/modules/auth', () => ({
  loginWithEmail: vi.fn(),
  logoutAuthSession: vi.fn(),
  refreshAuthSession: vi.fn().mockRejectedValue(new Error('unauthorized')),
  registerWithEmail: vi.fn(),
  getAdminEntry: vi.fn()
}))

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
  it('未登录时渲染模板首页和认证入口', async () => {
    render(<App />)

    expect(screen.getByRole('link', { name: 'Aged Fullstack Template' })).toBeTruthy()
    expect((await screen.findAllByText('登录')).length).toBeGreaterThan(0)
    expect((await screen.findAllByText('注册')).length).toBeGreaterThan(0)
  })
})
