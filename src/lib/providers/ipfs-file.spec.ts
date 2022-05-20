import { expect } from 'chai'
import { ipfs$ } from '$lib/contexts/ipfs'
import { firstValueFrom, mergeMap, reduce } from 'rxjs'
import { ipfsTextFile$ } from './ipfs-file'

const testCid = 'QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A'
const testContent = `Hello, <YOUR NAME HERE>`

describe('ipfs file stream', () => {
  after(() => {
    ipfs$.subscribe(ipfs => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      ipfs.stop()
    })
  })
  it('should be able to correctly read the file', async () => {
    const [file$] = ipfsTextFile$(testCid)
    expect(
      await firstValueFrom(
        file$.pipe(
          mergeMap(({ content$ }) => content$),
          reduce((acc, curr) => acc.concat(curr), ''),
        ),
      ),
    ).to.eq(testContent)

    return
  })
  // it doesn't abort idk why
})
