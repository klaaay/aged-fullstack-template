import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)

function getArg(name, fallback) {
  const index = args.indexOf(`--${name}`)
  if (index === -1) {
    return fallback
  }

  return args[index + 1]
}

function titleCaseFromSlug(slug) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const projectName = getArg('name')
const webPort = getArg('port-web', '80')
const webDevPort = getArg('port-web-dev', '5173')
const apiPort = getArg('port-api', '3000')
const postgresPort = getArg('port-postgres', '5432')
const redisPort = getArg('port-redis', '6379')

if (!projectName || !/^aged-[a-z0-9-]+$/.test(projectName)) {
  console.error('project name must match aged-*')
  process.exit(1)
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packageScope = `@${projectName}`
const projectTitle = titleCaseFromSlug(projectName)
const projectDbName = projectName.replace(/-/g, '_')

const replacements = [
  ['aged-fullstack-template-backend', `${projectName}-backend`],
  ['aged-fullstack-template', projectName],
  ['aged_fullstack_template', projectDbName],
  ['@aged-template/web', `${packageScope}/web`],
  ['@aged-template/meta', `${packageScope}/meta`],
  ['@aged-template', packageScope],
  ['Aged Fullstack Template', projectTitle]
]

const targetFiles = [
  'package.json',
  'pnpm-lock.yaml',
  '.env.example',
  'README.md',
  '.gitlab-ci.yml',
  '.github/workflows/release.yml',
  'docker-compose.yml',
  'docker-compose.dev.yml',
  'frontend/package.json',
  'frontend/index.html',
  'frontend/Dockerfile',
  'frontend/src/App.tsx',
  'frontend/src/App.test.tsx',
  'frontend/src/lib/env.ts',
  'frontend/vite.config.ts',
  'backend/pyproject.toml',
  'backend/uv.lock',
  'backend/app/core/config.py',
  'backend/tests/contracts/test_health.py',
  'libs/template-meta/package.json',
  'libs/template-meta/src/index.ts',
  'scripts/ci/check-docker.sh',
  'scripts/ci/build-images.sh',
  'scripts/ci/publish-images.sh',
  'scripts/start-web.sh',
  'scripts/init-project.mjs'
]

for (const file of targetFiles) {
  const filePath = path.join(rootDir, file)

  if (!fs.existsSync(filePath)) {
    continue
  }

  let content = fs.readFileSync(filePath, 'utf8')

  for (const [from, to] of replacements) {
    content = content.replaceAll(from, to)
  }

  if (file === '.env.example') {
    content = content
      .replace(/^WEB_PORT=.*$/m, `WEB_PORT=${webPort}`)
      .replace(/^WEB_DEV_PORT=.*$/m, `WEB_DEV_PORT=${webDevPort}`)
      .replace(/^API_PORT=.*$/m, `API_PORT=${apiPort}`)
      .replace(/^POSTGRES_PORT=.*$/m, `POSTGRES_PORT=${postgresPort}`)
      .replace(/^REDIS_PORT=.*$/m, `REDIS_PORT=${redisPort}`)
      .replace(
        /^DATABASE_URL=.*$/m,
        `DATABASE_URL=postgresql+psycopg://postgres:postgres@127.0.0.1:${postgresPort}/${projectDbName}`
      )
      .replace(/^REDIS_URL=.*$/m, `REDIS_URL=redis://127.0.0.1:${redisPort}/0`)
      .replace(
        /^VITE_API_BASE_URL=.*$/m,
        'VITE_API_BASE_URL=/api'
      )
      .replace(
        /^VITE_API_BUILD_BASE_URL=.*$/m,
        'VITE_API_BUILD_BASE_URL=/api'
      )
      .replace(
        /^VITE_API_PROXY_TARGET=.*$/m,
        `VITE_API_PROXY_TARGET=http://127.0.0.1:${apiPort}`
      )
  }

  if (file === 'backend/app/core/config.py') {
    content = content
      .replace(/api_port: int = \d+/m, `api_port: int = ${apiPort}`)
      .replace(
        /database_url: str = \(\n\s+"postgresql\+psycopg:\/\/postgres:postgres@127\.0\.0\.1:\d+\/[a-z0-9_]+"\n\s+\)/m,
        `database_url: str = (\n        "postgresql+psycopg://postgres:postgres@127.0.0.1:${postgresPort}/${projectDbName}"\n    )`
      )
      .replace(/redis_url: str = "redis:\/\/127\.0\.0\.1:\d+\/0"/m, `redis_url: str = "redis://127.0.0.1:${redisPort}/0"`)
  }

  if (file === 'frontend/src/lib/env.ts') {
    content = content.replace(/'\/api'/m, "'/api'")
  }

  if (file === 'frontend/vite.config.ts') {
    content = content.replace(
      /http:\/\/127\.0\.0\.1:\d+/m,
      `http://127.0.0.1:${apiPort}`
    )
  }

  fs.writeFileSync(filePath, content)
}

console.log(`initialized project: ${projectName}`)
console.log('next steps:')
console.log('1. pnpm install')
console.log('2. cd backend && uv sync')
console.log('3. cp .env.example .env')
console.log('4. pnpm infra:up')
console.log('5. pnpm db:migrate')
console.log('6. pnpm dev')
