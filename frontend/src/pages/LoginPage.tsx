import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'
import { toErrorMessage } from '../service/core/errors'

export function LoginPage() {
  const navigate = useNavigate()
  const { currentUser, isRestoring, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isRestoring && currentUser) {
    return <Navigate replace to="/" />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setFeedback('')

    try {
      await login(email, password)
      navigate('/')
    } catch (error) {
      setFeedback(toErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-panel">
      <h1>登录</h1>
      <p className="page-panel__description">使用模板内置认证能力进入当前项目。</p>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          邮箱
          <input
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
          />
        </label>
        <label>
          密码
          <input
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
          />
        </label>
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? '登录中...' : '登录'}
        </button>
      </form>
      {feedback ? <p className="feedback-message">{feedback}</p> : null}
      <p className="page-panel__footer">
        还没有账号？<Link to="/register">去注册</Link>
      </p>
    </section>
  )
}
