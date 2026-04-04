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
const webPort = getArg('port-web', '5173')
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
  'apps/web/package.json',
  'apps/web/index.html',
  'apps/web/Dockerfile',
  'apps/web/src/App.tsx',
  'apps/web/src/App.test.tsx',
  'apps/web/vite.config.ts',
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
      .replace('WEB_PORT=5173', `WEB_PORT=${webPort}`)
      .replace('API_PORT=3000', `API_PORT=${apiPort}`)
      .replace('POSTGRES_PORT=5432', `POSTGRES_PORT=${postgresPort}`)
      .replace('REDIS_PORT=6379', `REDIS_PORT=${redisPort}`)
      .replace(
        'DATABASE_URL=postgresql+psycopg://postgres:postgres@127.0.0.1:5432/aged_fullstack_template',
        `DATABASE_URL=postgresql+psycopg://postgres:postgres@127.0.0.1:${postgresPort}/${projectDbName}`
      )
      .replace(
        'REDIS_URL=redis://127.0.0.1:6379/0',
        `REDIS_URL=redis://127.0.0.1:${redisPort}/0`
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
