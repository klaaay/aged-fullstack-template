import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { toErrorMessage } from '../service/core/errors'
import { registerWithEmail } from '../service/modules/auth'

export function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setFeedback('')

    try {
      await registerWithEmail(email, password)
      navigate('/login', { replace: true })
    } catch (error) {
      setFeedback(toErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-panel">
      <h1>注册</h1>
      <p className="page-panel__description">创建一个普通用户账号，验证模板的会话能力。</p>
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
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
          />
        </label>
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? '提交中...' : '注册'}
        </button>
      </form>
      {feedback ? <p className="feedback-message">{feedback}</p> : null}
      <p className="page-panel__footer">
        已有账号？<Link to="/login">去登录</Link>
      </p>
    </section>
  )
}
