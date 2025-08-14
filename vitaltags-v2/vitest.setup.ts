import { config } from 'dotenv'
import { resolve } from 'node:path'

// Load env from project root .env for tests
config({ path: resolve(__dirname, '.env') })


