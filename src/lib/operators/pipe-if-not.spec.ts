import { expect } from 'chai'
import { firstValueFrom, from, map, pipe, tap, toArray } from 'rxjs'
import { pipeIf, pipeIfNot } from './pipe-if-not'

describe('pipeIfNot operator', () => {
  it('Should project the rejected elements of predicate', async () => {
    const source$ = from([1, 2, 3, 4])
    const operated = [] as number[]
    expect(
      await firstValueFrom(
        source$.pipe(
          pipeIfNot(
            map(x => x % 2 === 0),
            pipe(
              tap(x => operated.push(x)),
              map(x => x * 2),
            ),
          ),
          toArray(),
        ),
      ),
    ).to.deep.equal([2, 2, 6, 4])
    expect(operated).to.deep.equal([1, 3])
  })
})

describe('pipeIf operator', () => {
  it('Should project the accepted elements of predicate', async () => {
    const source$ = from([1, 2, 3, 4])
    const operated = [] as number[]
    expect(
      await firstValueFrom(
        source$.pipe(
          pipeIf(
            map(x => x % 2 === 0),
            pipe(
              tap(x => operated.push(x)),
              map(x => x * 2),
            ),
          ),
          toArray(),
        ),
      ),
    ).to.deep.equal([1, 4, 3, 8])
    expect(operated).to.deep.equal([2, 4])
  })
})
