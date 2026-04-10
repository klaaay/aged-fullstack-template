import { useState } from 'react'
import { Link } from 'react-router-dom'
import { templateDescription, templateDisplayName } from '@aged-template/meta'

import { PageHeader } from '../components/app'
import { ExamplePanel } from '../components/example'
import { SectionCard } from '../components/ui/SectionCard'
import { useAuth } from '../contexts/AuthContext'
import { useExampleState } from '../hooks/use-example-state'
import { toErrorMessage } from '../service/core/errors'
import { getAdminEntry } from '../service/modules/auth'

export function ExamplePage() {
  const { items, healthStatus, error, isLoading } = useExampleState()
  const { accessToken, currentUser, isRestoring } = useAuth()
  const [adminMessage, setAdminMessage] = useState('')
  const [adminError, setAdminError] = useState('')
  const [isCheckingAdminEntry, setIsCheckingAdminEntry] = useState(false)

  async function handleAdminCheck() {
    if (!accessToken) {
      return
    }

    setIsCheckingAdminEntry(true)
    setAdminMessage('')
    setAdminError('')

    try {
      const result = await getAdminEntry(accessToken)
      setAdminMessage(result.message)
    } catch (error) {
      setAdminError(toErrorMessage(error))
    } finally {
      setIsCheckingAdminEntry(false)
    }
  }

  return (
    <>
      <PageHeader title={templateDisplayName} description={templateDescription} />
      <ExamplePanel items={items} />
      <SectionCard title="认证基础能力">
        {isRestoring ? <p>正在恢复登录状态...</p> : null}
        {!isRestoring && !currentUser ? (
          <>
            <p>当前未登录。模板已内置注册、登录、刷新会话和登出能力。</p>
            <div className="inline-actions">
              <Link className="inline-actions__link" to="/login">
                登录
              </Link>
              <Link className="inline-actions__link" to="/register">
                注册
              </Link>
            </div>
          </>
        ) : null}
        {!isRestoring && currentUser ? (
          <dl className="status-list">
            <div>
              <dt>当前用户</dt>
              <dd>{currentUser.email}</dd>
            </div>
            <div>
              <dt>当前角色</dt>
              <dd>{currentUser.role}</dd>
            </div>
          </dl>
        ) : null}
      </SectionCard>
      {currentUser?.role === 'admin' ? (
        <SectionCard title="管理员入口">
          <p>这是模板内置的最小管理员能力入口，可继续扩展为更细颗粒度的 RBAC。</p>
          <button
            disabled={isCheckingAdminEntry}
            onClick={() => void handleAdminCheck()}
            type="button"
          >
            {isCheckingAdminEntry ? '验证中...' : '验证管理员入口'}
          </button>
          {adminMessage ? <p className="feedback-message">{adminMessage}</p> : null}
          {adminError ? <p className="feedback-message feedback-message--error">{adminError}</p> : null}
        </SectionCard>
      ) : null}
      <SectionCard title="服务状态">
        {isLoading && <p>正在检测 API...</p>}
        {!isLoading && error && <p>请求失败：{error.message}</p>}
        {!isLoading && !error && <p>后端健康状态：{healthStatus}</p>}
      </SectionCard>
    </>
  )
}
