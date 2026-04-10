# 模板认证基础能力实现计划

> **对于 agent 型执行者：** 必需子 skill：优先使用 `superpowers-subagent-driven-development`，否则使用 `superpowers-executing-plans` 逐任务实施本计划。所有步骤使用 `- [ ]` 复选框格式追踪。

**目标：** 将当前项目的登录、注册、登出、刷新会话、用户模型、角色字段和管理员入口沉淀为 `aged-fullstack-template` 的基础能力。

**架构：** 后端引入 `auth + users + security + refresh session` 骨架，并通过 Alembic 建立用户表；前端引入 `AuthContext + auth service + login/register routes` 与最小管理员入口；模板页面保持中性语义，只保留认证与授权骨架，不携带博客业务流程。

**技术栈：** FastAPI、SQLAlchemy、Alembic、Redis、JWT、React、React Router、Vitest、Pytest

---

### 任务 1: 建立后端认证与用户基础设施

**文件：**
- 创建： `backend/app/modules/auth/router.py`
- 创建： `backend/app/modules/auth/service.py`
- 创建： `backend/app/modules/auth/schemas.py`
- 创建： `backend/app/modules/auth/dependencies.py`
- 创建： `backend/app/modules/auth/__init__.py`
- 创建： `backend/app/modules/users/models.py`
- 创建： `backend/app/modules/users/repository.py`
- 创建： `backend/app/modules/users/service.py`
- 创建： `backend/app/modules/users/__init__.py`
- 创建： `backend/app/platform/security/jwt.py`
- 创建： `backend/app/platform/security/passwords.py`
- 创建： `backend/app/platform/security/__init__.py`
- 创建： `backend/app/platform/integrations/refresh_sessions.py`
- 修改： `backend/app/platform/config/settings.py`
- 修改： `backend/app/platform/db/model_registry.py`
- 修改： `backend/app/bootstrap/routing.py`

- [ ] **步骤 1: 从当前项目对照抽取后端认证骨架**

对照这些来源文件：

```text
/Users/wuzhen/CodeProjects/aged-multi-user-blog/backend/app/modules/auth/*
/Users/wuzhen/CodeProjects/aged-multi-user-blog/backend/app/modules/users/*
/Users/wuzhen/CodeProjects/aged-multi-user-blog/backend/app/platform/security/*
/Users/wuzhen/CodeProjects/aged-multi-user-blog/backend/app/platform/integrations/refresh_sessions.py
```

先整理出模板侧需要保留的最小接口和依赖：

- `register_user`
- `login_user`
- `refresh_access_token`
- `logout_user`
- `get_current_user`
- `require_admin`
- `ensure_default_admin_user`

- [ ] **步骤 2: 新建用户模型与仓储**

在 `backend/app/modules/users/models.py` 中加入中性的用户表定义，结构保持和当前项目一致：

```python
class UserRecord(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(32), default="user")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

在 `backend/app/modules/users/repository.py` 中提供：

```python
def create_user(session: Session, *, email: str, password_hash: str, role: str) -> UserRecord:
    user = UserRecord(email=email, password_hash=password_hash, role=role)
    session.add(user)
    session.flush()
    return user

def get_user_by_email(session: Session, email: str) -> UserRecord | None:
    return session.scalar(select(UserRecord).where(UserRecord.email == email))

def get_user_by_id(session: Session, user_id: str) -> UserRecord | None:
    return session.scalar(select(UserRecord).where(UserRecord.id == user_id))
```

- [ ] **步骤 3: 新建安全与 refresh session 基础设施**

在 `backend/app/platform/security/passwords.py` 中加入：

```python
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)
```

在 `backend/app/platform/security/jwt.py` 中加入 access / refresh token 的签发与解析。

在 `backend/app/platform/integrations/refresh_sessions.py` 中加入基于 Redis 的 session 持久化接口：

```python
def save_refresh_session(session_id: str, user_id: str, refresh_token_jti: str, expires_at: datetime) -> None:
    redis_client.set(
        _session_key(session_id),
        json.dumps({"user_id": user_id, "refresh_token_jti": refresh_token_jti}),
        ex=max(int(expires_at.timestamp() - datetime.now(expires_at.tzinfo).timestamp()), 1),
    )

def get_refresh_session(session_id: str) -> dict[str, str] | None:
    raw = redis_client.get(_session_key(session_id))
    return json.loads(raw) if raw else None

def delete_refresh_session(session_id: str) -> None:
    redis_client.delete(_session_key(session_id))

def replace_refresh_session(session_id: str, user_id: str, refresh_token_jti: str, expires_at: datetime) -> None:
    save_refresh_session(
        session_id=session_id,
        user_id=user_id,
        refresh_token_jti=refresh_token_jti,
        expires_at=expires_at,
    )
```

- [ ] **步骤 4: 新建认证 schema、service、router、dependencies**

在 `backend/app/modules/auth/schemas.py` 中定义：

```python
class RegisterInput(BaseModel):
    email: EmailStr
    password: constr(min_length=8)

class LoginInput(BaseModel):
    email: EmailStr
    password: str
```

在 `backend/app/modules/auth/service.py` 中实现：

```python
def register_user(payload: RegisterInput, session: Session) -> dict[str, str]:
    if get_user_by_email(session, payload.email):
        raise AppError(error_type="conflict", message="该邮箱已注册", status_code=409)
    user = create_user(session, email=payload.email, password_hash=hash_password(payload.password), role="user")
    session.commit()
    return {"id": user.id, "email": user.email, "role": user.role}

def login_user(payload: LoginInput, session: Session, response: Response) -> dict[str, object]:
    user = get_user_by_email(session, payload.email)
    if user is None or not verify_password(payload.password, user.password_hash):
        raise AppError(error_type="unauthorized", message="邮箱或密码错误", status_code=401)
    access_token = issue_access_token(user.id, user.role)
    session_id = str(uuid4())
    refresh_token, refresh_jti, expires_at = issue_refresh_token(user.id, session_id)
    save_refresh_session(session_id=session_id, user_id=user.id, refresh_token_jti=refresh_jti, expires_at=expires_at)
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax", path="/api/auth/refresh", expires=int(expires_at.timestamp()))
    return {"access_token": access_token, "user": {"id": user.id, "email": user.email, "role": user.role}}

def refresh_access_token(refresh_token: str | None, response: Response, session: Session) -> dict[str, object]:
    if not refresh_token:
        raise UnauthorizedError("刷新令牌不存在，请重新登录")
    payload = decode_token(refresh_token)
    session_id = payload.get("sid")
    user_id = payload.get("sub")
    refresh_jti = payload.get("jti")
    session_record = get_refresh_session(session_id) if isinstance(session_id, str) else None
    if session_record is None or session_record["refresh_token_jti"] != refresh_jti:
        raise UnauthorizedError("登录已失效，请重新登录")
    user = get_user_by_id(session, user_id) if isinstance(user_id, str) else None
    if user is None:
        raise UnauthorizedError("用户不存在或已失效")
    return {"access_token": issue_access_token(user.id, user.role), "user": {"id": user.id, "email": user.email, "role": user.role}}

def logout_user(refresh_token: str | None, response: Response) -> None:
    if refresh_token:
        payload = decode_token(refresh_token)
        session_id = payload.get("sid")
        if isinstance(session_id, str):
            delete_refresh_session(session_id)
    response.delete_cookie(key="refresh_token", path="/api/auth/refresh")
```

在 `backend/app/modules/auth/router.py` 中挂载：

```python
router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
@router.post("/login")
@router.post("/refresh")
@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
@router.get("/me")
```

在 `backend/app/modules/auth/dependencies.py` 中实现：

```python
def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    session: Session = Depends(get_db_session),
) -> UserRecord:
    if authorization is None or not authorization.startswith("Bearer "):
        raise UnauthorizedError("请先登录")
    token = authorization.removeprefix("Bearer ").strip()
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not isinstance(user_id, str):
        raise UnauthorizedError("登录状态无效，请重新登录")
    user = get_user_by_id(session, user_id)
    if user is None:
        raise UnauthorizedError("用户不存在或已失效")
    return user

def require_admin(current_user: UserRecord = Depends(get_current_user)) -> UserRecord:
    if current_user.role != "admin":
        raise ForbiddenError("当前账号没有管理员权限")
    return current_user
```

- [ ] **步骤 5: 接入配置、模型注册和路由**

修改 `backend/app/platform/config/settings.py`，补齐这些配置项：

```python
jwt_secret_key: str = "aged-fullstack-template-dev-secret-key-2026"
access_token_expire_minutes: int = 15
refresh_token_expire_days: int = 7
admin_email: str = "admin@example.com"
admin_password: str = "Admin123456!"
```

修改 `backend/app/platform/db/model_registry.py`：

```python
from app.modules.users.models import UserRecord

__all__ = ["ExampleRecord", "UserRecord"]
```

修改 `backend/app/bootstrap/routing.py`：

```python
from app.modules.auth.router import router as auth_router

api_router.include_router(auth_router)
```

- [ ] **步骤 6: 运行后端现有测试，确认新模块至少能被导入**

运行: `cd backend && uv run pytest tests/bootstrap/test_app_factory.py -v`

预期: 测试通过，应用工厂可正常启动。

### 任务 2: 建立数据库迁移与默认管理员初始化

**文件：**
- 修改： `backend/alembic/versions/0001_init_template.py`
- 修改： `backend/app/bootstrap/lifespan.py`
- 测试： `backend/tests/contracts/test_auth.py`
- 测试： `backend/tests/services/test_users.py`

- [ ] **步骤 1: 扩展初始 Alembic 迁移**

在 `backend/alembic/versions/0001_init_template.py` 中新增 `users` 表：

```python
op.create_table(
    "users",
    sa.Column("id", sa.String(length=36), nullable=False),
    sa.Column("email", sa.String(length=255), nullable=False),
    sa.Column("password_hash", sa.String(length=255), nullable=False),
    sa.Column("role", sa.String(length=32), nullable=False),
    sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    sa.PrimaryKeyConstraint("id"),
)
op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
```

如果模板中已有 example 表，保持原有表不动，只追加 `users`。

- [ ] **步骤 2: 在应用生命周期中植入默认管理员初始化**

修改 `backend/app/bootstrap/lifespan.py`，在现有启动逻辑中调用：

```python
with SessionLocal() as session:
    ensure_default_admin_user(session)
    session.commit()
```

要求：

- 只有在 `users` 表存在时才初始化
- 若管理员已存在则不重复创建

- [ ] **步骤 3: 编写认证后端测试**

在 `backend/tests/contracts/test_auth.py` 中新增这些测试：

```python
def test_register_creates_user(client):
    response = client.post("/api/auth/register", json={"email": "user@example.com", "password": "Password123!"})
    assert response.status_code == 201

def test_register_rejects_duplicate_email(client):
    client.post("/api/auth/register", json={"email": "user@example.com", "password": "Password123!"})
    response = client.post("/api/auth/register", json={"email": "user@example.com", "password": "Password123!"})
    assert response.status_code == 409

def test_login_returns_access_token_and_sets_cookie(client):
    client.post("/api/auth/register", json={"email": "user@example.com", "password": "Password123!"})
    response = client.post("/api/auth/login", json={"email": "user@example.com", "password": "Password123!"})
    assert response.status_code == 200
    assert response.json()["data"]["access_token"]
    assert "refresh_token=" in response.headers["set-cookie"]

def test_refresh_returns_new_access_token(client):
    client.post("/api/auth/register", json={"email": "user@example.com", "password": "Password123!"})
    login_response = client.post("/api/auth/login", json={"email": "user@example.com", "password": "Password123!"})
    response = client.post("/api/auth/refresh", headers={"cookie": login_response.headers["set-cookie"]})
    assert response.status_code == 200
    assert response.json()["data"]["access_token"]

def test_logout_clears_refresh_session(client):
    client.post("/api/auth/register", json={"email": "user@example.com", "password": "Password123!"})
    login_response = client.post("/api/auth/login", json={"email": "user@example.com", "password": "Password123!"})
    response = client.post("/api/auth/logout", headers={"cookie": login_response.headers["set-cookie"]})
    assert response.status_code == 204
```

在 `backend/tests/services/test_users.py` 中新增：

```python
def test_ensure_default_admin_user_creates_admin_once(session):
    ensure_default_admin_user(session)
    ensure_default_admin_user(session)
    assert get_user_by_email(session, settings.admin_email) is not None
```

- [ ] **步骤 4: 运行新增后端测试验证通过**

运行: `cd backend && uv run pytest tests/contracts/test_auth.py tests/services/test_users.py -v`

预期: 新增认证测试全部通过。

### 任务 3: 建立前端认证会话与路由骨架

**文件：**
- 创建： `frontend/src/contexts/AuthContext.tsx`
- 创建： `frontend/src/service/modules/auth.ts`
- 创建： `frontend/src/pages/LoginPage.tsx`
- 创建： `frontend/src/pages/RegisterPage.tsx`
- 创建： `frontend/src/router.tsx`
- 修改： `frontend/src/App.tsx`
- 修改： `frontend/src/pages/index.ts`
- 修改： `frontend/src/service/modules/index.ts`
- 测试： `frontend/src/App.test.tsx`
- 测试： `frontend/src/service/modules/auth.test.ts`

- [ ] **步骤 1: 新建认证 service**

在 `frontend/src/service/modules/auth.ts` 中加入：

```ts
export type User = {
  id: string
  email: string
  role: string
}

export function registerWithEmail(email: string, password: string) {
  return requestJson<ApiResponse<User>>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}

export function loginWithEmail(email: string, password: string) {
  return requestJson<ApiResponse<AuthResult>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}

export function refreshAuthSession() {
  return requestJson<ApiResponse<AuthResult>>('/auth/refresh', {
    method: 'POST'
  })
}

export function logoutAuthSession() {
  return requestNoContent('/auth/logout', {
    method: 'POST'
  })
}
```

这些函数应复用现有 `requestJson` / `requestNoContent` 封装，路径统一走 `/auth/*`。

- [ ] **步骤 2: 新建 AuthContext**

在 `frontend/src/contexts/AuthContext.tsx` 中实现：

```tsx
type AuthContextValue = {
  accessToken: string | null
  currentUser: User | null
  isRestoring: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}
```

启动时自动调用 `refreshSession()`，成功则恢复用户，失败则进入未登录态。

- [ ] **步骤 3: 新建登录页、注册页和路由**

在 `frontend/src/pages/LoginPage.tsx` 中提供邮箱、密码输入和提交逻辑。

在 `frontend/src/pages/RegisterPage.tsx` 中提供邮箱、密码、确认密码输入和提交逻辑。

在 `frontend/src/router.tsx` 中新增：

```tsx
<Route path="/" element={<ExamplePage />} />
<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />
```

并在导航区域加入：

```tsx
{!currentUser ? <Link to="/login">登录</Link> : null}
{!currentUser ? <Link to="/register">注册</Link> : null}
{currentUser ? <span>{currentUser.email}</span> : null}
```

- [ ] **步骤 4: 修改 App 入口切到认证 + 路由**

修改 `frontend/src/App.tsx`：

```tsx
export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
```

同步更新 `frontend/src/pages/index.ts` 和 `frontend/src/service/modules/index.ts` 的导出。

- [ ] **步骤 5: 编写前端认证测试**

在 `frontend/src/service/modules/auth.test.ts` 中新增：

```ts
it('调用登录接口并返回用户信息', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { access_token: 'token', user: { id: '1', email: 'admin@example.com', role: 'admin' } } }), { status: 200 })))
  const response = await loginWithEmail('admin@example.com', 'Password123!')
  expect(response.data.user.role).toBe('admin')
})

it('调用刷新接口并保留 cookie 模式', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { access_token: 'token', user: { id: '1', email: 'admin@example.com', role: 'admin' } } }), { status: 200 })))
  await refreshAuthSession()
  expect(fetch).toHaveBeenCalledWith('/api/auth/refresh', expect.any(Object))
})
```

修改 `frontend/src/App.test.tsx`，验证：

```ts
it('refresh 失败时渲染登录入口', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { message: 'unauthorized' } }), { status: 401 })))
  render(<App />)
  expect(await screen.findByRole('link', { name: '登录' })).toBeTruthy()
})

it('管理员用户恢复后显示邮箱和管理入口', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { access_token: 'token', user: { id: '1', email: 'admin@example.com', role: 'admin' } } }), { status: 200 })))
  render(<App />)
  expect(await screen.findByText('admin@example.com')).toBeTruthy()
  expect(await screen.findByText('管理入口')).toBeTruthy()
})
```

- [ ] **步骤 6: 运行前端测试验证通过**

运行: `pnpm --filter @aged-template/web test`

预期: 现有测试和新增认证测试全部通过。

### 任务 4: 将管理员入口收敛为模板中性示例

**文件：**
- 修改： `frontend/src/pages/ExamplePage.tsx`
- 修改： `frontend/src/components/app/PageHeader.tsx`
- 测试： `frontend/src/App.test.tsx`

- [ ] **步骤 1: 在 example 页面加入最小管理员入口**

在 `frontend/src/pages/ExamplePage.tsx` 中引入 `useAuth()`，在用户为管理员时展示一块中性提示：

```tsx
{currentUser?.role === 'admin' ? (
  <SectionCard title="管理入口">
    <p>当前账号具备管理员权限，可在这里挂接管理类示例页面。</p>
  </SectionCard>
) : null}
```

不要引入博客中的“分类管理”“文章管理”等术语。

- [ ] **步骤 2: 保持页面文案中性**

若导航或头部文案出现业务语义，改成：

```tsx
Link 文案: "管理入口"
提示文案: "模板已启用认证与最小授权骨架"
```

- [ ] **步骤 3: 运行页面相关测试**

运行: `pnpm --filter @aged-template/web test -- src/App.test.tsx`

预期: 普通用户与管理员两种显隐逻辑都通过。

### 任务 5: 补齐端到端验证并整理文档

**文件：**
- 修改： `README.md`
- 修改： `backend/pyproject.toml`
- 修改： `.env.example`

- [ ] **步骤 1: 补齐运行所需依赖**

确认 `backend/pyproject.toml` 包含这些依赖：

```toml
"pyjwt>=2.10.0",
"passlib[bcrypt]>=1.7.4",
"email-validator>=2.2.0",
```

若缺失则补齐，并重新 `uv sync`。

- [ ] **步骤 2: 补齐模板环境变量说明**

在 `.env.example` 或 `README.md` 中加入：

```text
JWT_SECRET_KEY / jwt_secret_key
ADMIN_EMAIL
ADMIN_PASSWORD
```

文案要说明：

- 默认管理员账号用于验证模板认证骨架
- 可在派生项目中自行替换

- [ ] **步骤 3: 运行完整模板验证**

运行:

```bash
pnpm test
pnpm --filter @aged-template/web build
cd backend && uv run pytest
```

如本地已启动 Redis / 数据库，再额外验证：

```bash
pnpm docker:up:dev
curl -X POST http://127.0.0.1:5173/api/auth/register -H 'Content-Type: application/json' -d '{"email":"user@example.com","password":"Password123!"}'
curl -X POST http://127.0.0.1:5173/api/auth/login -H 'Content-Type: application/json' -d '{"email":"user@example.com","password":"Password123!"}'
```

预期：

- 测试全部通过
- 前端 build 成功
- 注册 / 登录 / 刷新 / 登出链路可用

- [ ] **步骤 4: 提交**

```bash
git add backend frontend README.md .env.example
git commit -m "Add auth foundation to template"
```
