import { templateDisplayName } from '@aged-template/meta'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'

import { useAuth } from './contexts/AuthContext'
import { AppLayout } from './layouts'
import { ExamplePage, LoginPage, RegisterPage } from './pages'

function AppNavigation() {
  const title = templateDisplayName
  const { currentUser, isRestoring, logout } = useAuth()

  return (
    <header className="app-nav">
      <Link className="app-nav__brand" to="/">
        {title}
      </Link>
      <nav className="app-nav__links">
        <Link to="/">模板首页</Link>
        {!currentUser && !isRestoring ? <Link to="/login">登录</Link> : null}
        {!currentUser && !isRestoring ? <Link to="/register">注册</Link> : null}
        {currentUser ? (
          <>
            <span className="app-nav__meta">{currentUser.email}</span>
            <span className="app-nav__meta">{currentUser.role}</span>
            <button onClick={() => void logout()} type="button">
              退出
            </button>
          </>
        ) : null}
      </nav>
    </header>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppLayout>
        <AppNavigation />
        <Routes>
          <Route path="/" element={<ExamplePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}
