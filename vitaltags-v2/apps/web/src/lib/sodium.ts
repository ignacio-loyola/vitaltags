import sodiumLib from 'libsodium-wrappers'

let sodiumReady: Promise<typeof sodiumLib> | null = null
let sodiumInstance: typeof sodiumLib | null = null

export async function getSodium(): Promise<typeof sodiumLib> {
  if (sodiumInstance) return sodiumInstance
  if (!sodiumReady) {
    sodiumReady = (async () => {
      await sodiumLib.ready
      sodiumInstance = sodiumLib
      return sodiumInstance
    })()
  }
  return sodiumReady
}


