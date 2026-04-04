import { useEffect, useState } from 'react'
import { templateProjectName } from '@aged-template/meta'
import { getHealth } from './lib/api'

type HealthState =
  | { kind: 'loading' }
  | { kind: 'success'; status: string }
  | { kind: 'error'; message: string }

export default function App() {
  const [health, setHealth] = useState<HealthState>({ kind: 'loading' })

  useEffect(() => {
    getHealth()
      .then((result) => {
        setHealth({ kind: 'success', status: result.status })
      })
      .catch((error: Error) => {
        setHealth({ kind: 'error', message: error.message })
      })
  }, [])

  return (
    <main>
      <h1>{templateProjectName}</h1>
      <p>面向 aged-* 业务项目的全栈模板。</p>
      <section>
        <h2>服务状态</h2>
        {health.kind === 'loading' && <p>正在检测 API...</p>}
        {health.kind === 'success' && <p>后端健康状态：{health.status}</p>}
        {health.kind === 'error' && <p>请求失败：{health.message}</p>}
      </section>
    </main>
  )
}
