# aged-fullstack-template

一个面向 `aged-*` 业务项目的全栈母版仓库。

它的目标很直接：

- 作为模板仓库时，自己能跑、能测、能走 CI/CD
- 作为业务起点时，复制后执行一次 `init:project` 就能改名
- 只提供最小可用骨架，不预置具体业务逻辑

## 模板包含什么

当前模板内置这些能力：

- 前端：React + Vite + Vitest
- 后端：FastAPI + pytest
- 基础设施：PostgreSQL、Redis、Docker Compose
- 共享层：`libs/template-meta`
- 初始化脚本：`pnpm init:project`
- CI/CD：
  GitHub Actions、GitLab CI、镜像构建与发布脚本

当前模板刻意**不**内置这些内容：

- 登录鉴权
- 用户体系
- 文件上传
- 多租户
- RAG / 向量检索
- 复杂队列消费逻辑

## 目录结构

```text
.
├─ apps/
│  └─ web/                  # React + Vite 前端
│     └─ src/
│        ├─ components/
│        ├─ contexts/
│        ├─ hooks/
│        ├─ layouts/
│        ├─ pages/
│        ├─ service/
│        └─ styles/
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

前端当前已经体现这些层级：

- `components/app`
- `components/example`
- `components/ui`
- `contexts`
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
- `platform/config`
- `platform/db`
- `platform/integrations`
- `scripts`
- `shared/errors`
- `shared/http`

其中：

- `bootstrap` 负责应用装配
- `platform` 负责运行时基础设施
- `shared` 仅保留轻量公共代码
- `modules/*` 负责业务模块实现

这些 example 文件是可运行的，不是空壳；但它们只表达结构，不表达具体业务域。

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
  --port-web 5174 \
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

运行态会启动：

- `postgres`
- `redis`
- `api`
- `web`
- `nginx`

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
