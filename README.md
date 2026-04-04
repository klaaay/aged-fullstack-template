# aged-fullstack-template

一个面向 `aged-*` 业务项目的最小全栈模板。

## 目录结构

```text
.
├─ apps/web
├─ backend
├─ libs
├─ scripts
├─ docker
└─ docs
```

## 环境要求

- Node.js >= 20
- pnpm
- Python >= 3.12
- uv
- Docker

## 初始化新项目

```bash
cp -R aged-fullstack-template aged-order-center
cd aged-order-center
node ./scripts/init-project.mjs --name aged-order-center
```

## 启动

```bash
pnpm install
cd backend && uv sync
cd ..
cp .env.example .env
pnpm infra:up
pnpm db:migrate
pnpm dev
```

## 测试

```bash
pnpm test
```

## CI/CD

- GitHub Actions：`.github/workflows/ci.yml`、`.github/workflows/release.yml`
- GitLab CI：`.gitlab-ci.yml`
- 两套流水线共用 `scripts/ci/*`，派生项目时会由 `init:project` 一起改名
