import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aged-template-'))
const copyDir = path.join(tempRoot, 'aged-fullstack-template')

fs.cpSync(repoRoot, copyDir, {
  recursive: true,
  filter(source) {
    return ![
      `${path.sep}.git`,
      `${path.sep}node_modules`,
      `${path.sep}backend${path.sep}.venv`
    ].some((segment) => source.includes(segment))
  }
})

execFileSync(
  'node',
  [
    './scripts/init-project.mjs',
    '--name',
    'aged-demo',
    '--port-api',
    '3001',
    '--port-postgres',
    '55432',
    '--port-redis',
    '56379'
  ],
  {
    cwd: copyDir,
    stdio: 'inherit'
  }
)

const settings = fs.readFileSync(
  path.join(copyDir, 'backend/app/platform/config/settings.py'),
  'utf8'
)
const envExample = fs.readFileSync(path.join(copyDir, '.env.example'), 'utf8')

if (!settings.includes('project_name: str = "aged-demo"')) {
  throw new Error('settings.py did not update project_name')
}

if (!settings.includes('api_port: int = 3001')) {
  throw new Error('settings.py did not update api_port')
}

if (!envExample.includes('POSTGRES_PORT=55432')) {
  throw new Error('.env.example did not update POSTGRES_PORT')
}

if (!envExample.includes('REDIS_PORT=56379')) {
  throw new Error('.env.example did not update REDIS_PORT')
}
