import { Option } from '$lib/types'
import { expect } from 'chai'
import { firstValueFrom, from, tap, toArray } from 'rxjs'
import { switchSomeMembers } from './pass-undefined'

describe('passNilAny operator', () => {
  it('Should pass if the tuple contains at least one nil value and operate otherwise', async () => {
    type Test = [string, Option<number>, Option<boolean>]
    const source$ = from<Test[]>([
      ['1', null, false],
      ['5', 2, undefined],
      ['3', 4, true],
    ])
    const operatedValues = [] as Test[]
    expect(
      await firstValueFrom(
        source$.pipe(switchSomeMembers(tap(x => operatedValues.push(x))), toArray()),
      ),
    ).to.deep.equal([null, undefined, ['3', 4, true]])
    expect(operatedValues).to.deep.equal([['3', 4, true]])
  })
})

describe('passNil operator', () => {
  it('Should pass if the tuple contains at least one nil value and operate otherwise', async () => {
    type Test = [string, Option<number>, Option<boolean>]
    const source$ = from<Test[]>([
      ['1', null, false],
      ['5', 2, undefined],
      ['3', 4, true],
    ])
    const operatedValues = [] as Test[]
    expect(
      await firstValueFrom(
        source$.pipe(switchSomeMembers(tap(x => operatedValues.push(x))), toArray()),
      ),
    ).to.deep.equal([null, undefined, ['3', 4, true]])
    expect(operatedValues).to.deep.equal([['3', 4, true]])
  })
})
