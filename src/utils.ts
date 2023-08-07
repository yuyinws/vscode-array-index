export function debounce(fn: (...args: any[]) => void, delay: number) {
  let timer: NodeJS.Timeout

  return function (this: any, ...args: any[]) {
    clearTimeout(timer) // 清除之前可能存在的定时器

    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
