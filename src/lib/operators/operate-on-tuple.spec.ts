import { expect } from 'chai'
import { firstValueFrom, of } from 'rxjs'
import { mapIndex } from './operate-on-tuple'

describe('map index operator', () => {
  it('Should map the correct index with project function', async () => {
    const source$ = of([1, 2, 3] as const)
    expect(await firstValueFrom(source$.pipe(mapIndex('1', x => of(x + 5))))).to.deep.equal([
      1, 7, 3,
    ])
  })
})
