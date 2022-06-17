export async function waitFor(timeout: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve()
    }, timeout)
  })
}

export function waitForF(timeout: number): () => Promise<void> {
  return () => waitFor(timeout)
}

export async function singleAnimationFrame(): Promise<number> {
  if (typeof window !== 'undefined') {
    return new Promise(res => {
      requestAnimationFrame(res)
    })
  }
  return Promise.resolve(0)
}

export async function animationFrame(times = 1): Promise<number> {
  return Array(times)
    .fill(undefined)
    .reduce(acc => acc.then(singleAnimationFrame), Promise.resolve(0))
}

export function animationFrameF(times = 1): () => Promise<number> {
  return () => animationFrame(times)
}
