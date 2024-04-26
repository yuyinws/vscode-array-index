import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'pathe'

const DIR_DIST = typeof __dirname !== 'undefined'
  ? __dirname
  : dirname(fileURLToPath(import.meta.url))

export const GO_PARSER_PATH = resolve(DIR_DIST, './src/main.go')

console.log(GO_PARSER_PATH)
