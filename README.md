# aged-fullstack-template

一个面向 `aged-*` 业务项目的全栈母版仓库。

它的目标很直接：

- 作为模板仓库时，自己能跑、能测、能走 CI/CD
- 作为业务起点时，复制后执行一次 `init:project` 就能改名
- 只提供最小可用骨架，不预置具体业务逻辑

## 模板包含什么

当前模板内置这些能力：

- 前端：React + Vite + Vitest
- 后端：FastAPI + SQLAlchemy + Alembic + pytest
- 基础设施：PostgreSQL、Redis、Docker Compose
- 认证基础能力：注册、登录、登出、刷新会话、当前用户态、默认管理员入口
- 共享层：`libs/template-meta`
- 初始化脚本：`pnpm init:project`
- CI/CD：
  GitHub Actions、GitLab CI、镜像构建与发布脚本

当前模板刻意**不**内置这些内容：

- 文件上传
- 多租户
- RAG / 向量检索
- 复杂队列消费逻辑
- 细颗粒度 RBAC / ABAC 权限模型

## 目录结构

```text
.
├─ frontend/                # React + Vite 前端
│  └─ src/
│     ├─ components/
│     ├─ hooks/
│     ├─ layouts/
│     ├─ pages/
│     ├─ service/
│     └─ styles/
├─ backend/                 # FastAPI 后端
│  └─ app/
│     ├─ bootstrap/
│     ├─ modules/
│     ├─ platform/
│     ├─ scripts/
│     └─ shared/
├─ libs/
│  └─ template-meta/        # 模板共享元信息
├─ scripts/
│  ├─ ci/                   # GitHub / GitLab 共用 CI 脚本
│  └─ *.sh                  # 本地开发与初始化辅助脚本
├─ docker/                  # Nginx 与基础容器配置
├─ .github/workflows/       # GitHub Actions
├─ .gitlab-ci.yml           # GitLab CI
├─ docker-compose.yml       # 运行态 / 通用 Compose
├─ docker-compose.dev.yml   # 开发态 Compose
└─ README.md
```

## 结构约定

这个模板会保留原项目的分层形式，但用中性的 example 文件表达职责。

默认开发路径有两条主线：

- 后端：坚持 `module-first`
- 前端：请求统一收口到 `service`

前端当前已经体现这些层级：

- `components/app`
- `components/example`
- `components/ui`
- `hooks`
- `layouts`
- `pages`
- `service/core`
- `service/modules`
- `styles`

后端当前已经体现这些层级：

- `bootstrap`
- `modules/example`
- `modules/health`
 - `modules/auth`
 - `modules/users`
- `platform/config`
- `platform/db`
- `platform/integrations`
- `platform/security`
- `scripts`
- `shared/errors`
- `shared/http`

其中：

- `bootstrap` 负责应用装配
- `platform` 负责运行时基础设施
- `shared` 仅保留轻量公共代码
- `modules/*` 负责业务模块实现
- `service/core` 负责 axios client、拦截器和统一错误归一化
- `service/modules` 负责具体模块 API
- `libs/template-meta` 是模板静态元信息的单一来源

这些 example 文件是可运行的，不是空壳；但它们只表达结构，不表达具体业务域。

### 后端模块默认结构

后端继续以 `modules/<name>` 作为第一组织单位。默认模块结构如下：

```text
modules/<name>/
├─ router.py
├─ service.py
├─ schemas.py
├─ models.py
└─ repository.py   # optional
```

默认黄金路径是：

`router.py -> service.py -> Session + ORM model`

也就是说：

- `router.py` 只负责 HTTP 层
- `service.py` 是模块内默认业务入口
- `schemas.py` 放请求/响应 DTO
- `models.py` 放 SQLAlchemy ORM model

`repository.py` 不是强制层。只有在查询逻辑复杂、多个 service 需要复用同一批查询，或需要把查询拼装和业务编排拆开时，才引入它。

### 前端请求组织

前端不再保留额外的 `lib` 请求入口。默认请求组织如下：

```text
service/
├─ core/
│  ├─ client.ts
│  ├─ interceptors.ts
│  └─ errors.ts
└─ modules/
   ├─ example.ts
   └─ health.ts
```

其中：

- `service/core/client.ts` 创建统一的 axios client
- `service/core/interceptors.ts` 负责请求、响应拦截
- `service/core/errors.ts` 负责统一错误结构
- `service/modules/*` 只负责模块 API

## 环境要求

- Node.js `>= 20`
- `pnpm`
- Python `>= 3.12`
- `uv`
- Docker 与 Docker Compose

## 先运行模板本身

如果你想先确认模板仓库本身可用，按下面执行：

```bash
pnpm install
cd backend && uv sync
cd ..
cp .env.example .env
pnpm infra:up
pnpm db:migrate
pnpm dev
```

默认地址：

- Web：`http://127.0.0.1:5173`
- API：`http://127.0.0.1:3000`
- 健康检查：`http://127.0.0.1:3000/api/health`

默认管理员账号：

- 邮箱：`admin@example.com`
- 密码：`Admin123456!`

## 从模板派生新项目

### 最小派生流程

```bash
cp -R aged-fullstack-template aged-order-center
cd aged-order-center
node ./scripts/init-project.mjs --name aged-order-center
pnpm install
cd backend && uv sync
cd ..
cp .env.example .env
pnpm infra:up
pnpm db:migrate
pnpm dev
```

### 带端口覆盖的派生流程

如果本机端口有冲突，可以在初始化时直接改掉默认值：

```bash
node ./scripts/init-project.mjs \
  --name aged-order-center \
  --port-web 80 \
  --port-web-dev 5174 \
  --port-api 3001 \
  --port-postgres 55432 \
  --port-redis 56379
```

### `init:project` 会改哪些东西

初始化脚本会同步替换这些内容：

- 根项目名
- 前端 workspace 包名
- 后端包名
- README 中的模板名称
- `.env.example` 中的项目名、数据库名、端口
- `.github/workflows/release.yml`
- `.gitlab-ci.yml`
- `scripts/ci/*` 里的默认镜像命名
- `docker-compose*.yml`、`package.json`、共享元信息等模板标识
- `backend/app/platform/config/settings.py` 中的默认项目配置

## 常用命令

```bash
pnpm dev                 # 同时启动前端和后端
pnpm dev:web             # 仅启动前端
pnpm dev:api             # 仅启动后端
pnpm test                # 前后端测试一起跑
pnpm test:web            # 前端测试
pnpm test:backend        # 后端测试
pnpm build:web           # 前端构建
pnpm db:migrate          # 执行 Alembic 迁移
pnpm infra:up            # 启动 PostgreSQL 和 Redis
pnpm infra:down          # 停止 PostgreSQL 和 Redis
pnpm docker:up           # 启动 Compose 运行栈
pnpm docker:up:dev       # 启动 Compose 开发栈
pnpm docker:down         # 停止 Compose 运行栈
pnpm docker:down:dev     # 停止 Compose 开发栈
pnpm init:project --name aged-your-project
```

## Docker 用法

### 开发态

```bash
cp .env.example .env
pnpm docker:up:dev
```

默认访问：

- Web：`http://127.0.0.1:5173`
- API：`http://127.0.0.1:3000`

### 运行态

```bash
cp .env.example .env
pnpm docker:up
```

运行态会使用前端打包产物启动，并由前端镜像内的 nginx 同时负责静态资源和 `/api` 反向代理。会启动：

- `postgres`
- `redis`
- `api`
- `web`

如需覆盖运行态前端请求地址，请设置 `VITE_API_BUILD_BASE_URL`；开发态仍使用 `WEB_DEV_PORT`、`VITE_API_BASE_URL` 和 `VITE_API_PROXY_TARGET`。

## 认证基础能力

模板当前内置一套中性的认证骨架，适合作为业务项目起点：

- 注册：`POST /api/auth/register`
- 登录：`POST /api/auth/login`
- 刷新会话：`POST /api/auth/refresh`
- 登出：`POST /api/auth/logout`
- 当前用户：`GET /api/auth/me`
- 管理员入口示例：`GET /api/auth/admin-entry`

默认授权模型只有两层：

- `user`
- `admin`

这套能力只负责认证和最小管理员入口示例，不等于完整 RBAC。后续业务可以在此基础上继续扩展角色、权限点和资源级策略。

## CI/CD

模板内置两套平台配置：

- GitHub Actions：
  `.github/workflows/ci.yml`
  `.github/workflows/release.yml`
- GitLab CI：
  `.gitlab-ci.yml`

两套平台都共用这一组脚本：

- `scripts/ci/setup-node.sh`
- `scripts/ci/setup-python.sh`
- `scripts/ci/check-web.sh`
- `scripts/ci/check-backend.sh`
- `scripts/ci/check-docker.sh`
- `scripts/ci/build-images.sh`
- `scripts/ci/publish-images.sh`

### CI 现在检查什么

- 前端测试
- 前端构建
- 后端测试
- Docker 镜像构建
- Compose 配置可展开

### 发布镜像时会产出什么

当前模板只发布两类镜像：

- `web`
- `api`

没有预置 `worker` 镜像，因为模板当前没有独立 worker 进程。

## 镜像发布约定

GitHub 和 GitLab 的发布逻辑都走 `scripts/ci/publish-images.sh`。

关键环境变量：

- `ENABLE_IMAGE_PUBLISH=true`
- `IMAGE_REGISTRY`
- `IMAGE_NAMESPACE`
- `IMAGE_TAG`
- `REGISTRY_USERNAME`
- `REGISTRY_PASSWORD`

如果没有显式启用，发布脚本会直接退出，不会误推镜像。

## 推荐的派生后第一步

派生出新业务仓库后，建议按这个顺序做：

1. 先跑 `pnpm test`
2. 再确认 `pnpm dev` 能启动
3. 再开始替换首页、示例接口、数据库迁移
4. 最后才加鉴权、上传、队列、RAG 这类重能力

## 已验证的模板链路

当前这个模板仓库已经实际验证过这些链路：

- 模板仓库 `pnpm test` 通过
- 模板仓库 `pnpm db:migrate` 通过
- 模板仓库 `pnpm dev` 可启动
- 模板仓库 `pnpm docker:up:dev` 可启动
- `scripts/ci/check-web.sh`、`check-backend.sh`、`check-docker.sh` 可运行
- 复制模板后执行 `init:project`，不会残留旧模板名

## 适合怎么用

适合：

- 新起一个 `aged-*` 业务项目
- 需要一套前后端 + 数据库 + 缓存 + CI/CD 的统一母版
- 希望 GitHub 和 GitLab 两边都能共用一套检查逻辑

不适合：

- 直接拿去做内容型站点母版
- 直接拿去做带鉴权、多租户、RAG 的重业务母版
- 需要一步生成完整业务模块脚手架的场景
