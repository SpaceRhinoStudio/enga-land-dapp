import type IPFS from 'ipfs-core'

declare global {
  const Ipfs: typeof IPFS
}
