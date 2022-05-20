import { expect } from 'chai'
import { firstValueFrom, from, mergeMap, of, reduce, throwError } from 'rxjs'
import { filterErrors } from './safe-throw'

describe('safe throw operator', () => {
  it('Should filter errors', async () => {
    const source$ = from([1, 2, 3, 4, 5, 6]).pipe()
    expect(
      await firstValueFrom(
        source$.pipe(
          filterErrors(mergeMap(x => (x % 2 === 0 ? throwError(() => 'something') : of(x)))),
          reduce((acc, x) => [...acc, x], [] as number[]),
        ),
      ),
    ).to.deep.equal([1, 3, 5])
  })
})
