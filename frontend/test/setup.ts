import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// 让每个测试文件都从干净的 DOM 状态开始。
afterEach(() => {
  cleanup()
})
