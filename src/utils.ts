import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'pathe'

export function debounce(fn: (...args: any[]) => void, delay: number) {
  let timer: NodeJS.Timeout

  return function (this: any, ...args: any[]) {
    clearTimeout(timer) // 清除之前可能存在的定时器

    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

const DIR_DIST = typeof __dirname !== 'undefined'
  ? __dirname
  : dirname(fileURLToPath(import.meta.url))

export const GO_PARSER_PATH = resolve(DIR_DIST, './parser.go')
