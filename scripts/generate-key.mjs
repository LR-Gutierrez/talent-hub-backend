import { readFileSync, writeFileSync } from 'fs'
import { randomBytes } from 'crypto'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env')
const key = randomBytes(32).toString('hex')

let env = readFileSync(envPath, 'utf-8')

if (/^JWT_SECRET=/m.test(env)) {
  env = env.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${key}`)
} else {
  env += `\nJWT_SECRET=${key}\n`
}

writeFileSync(envPath, env)
console.log(`JWT_SECRET generated: ${key}`)
