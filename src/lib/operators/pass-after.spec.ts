import { expect } from 'chai'
import { delay, firstValueFrom, from, interval, map, of, pipe, take, tap, toArray } from 'rxjs'
import { useFakeTimers, SinonFakeTimers } from 'sinon'
import { passAfter, waitForJobExhaust, waitForJobSwitch } from './pass-after'
import { fakeSchedulers } from 'rxjs-marbles/mocha'
import _ from 'lodash'

describe('passAfter operator', () => {
  let clock: SinonFakeTimers
  beforeEach(function () {
    clock = useFakeTimers()
  })

  afterEach(function () {
    clock.restore()
  })

  it(
    'Should wait for the mid operator to emit before passing (the same) elements',
    fakeSchedulers(async () => {
      const source$ = of(9)
      const sequence = [] as number[]
      let res: number | undefined = undefined

      const promise = firstValueFrom(
        source$.pipe(
          tap(() => sequence.push(0)),
          passAfter(
            pipe(
              tap(() => sequence.push(1)),
              delay(1000),
              tap(() => sequence.push(2)),
              map(() => null),
            ),
          ),
          tap(() => sequence.push(3)),
          tap(x => (res = x)),
          toArray(),
        ),
      )
      clock.tick(500)
      expect(res).to.equal(undefined)
      clock.tick(600)
      expect(res).to.equal(9)
      expect(await promise).to.deep.equal([9])
      expect(sequence).to.deep.equal([0, 1, 2, 3])
    }),
  )
})

describe('waitForJobSwitch and waitForJobExhaust operators', () => {
  let clock: SinonFakeTimers
  beforeEach(function () {
    clock = useFakeTimers()
  })

  afterEach(function () {
    clock.restore()
  })

  it(
    'Should wait for the job to finish before passing projected value [switch][sync]',
    fakeSchedulers(async () => {
      const source$ = from([10, 20, 30])
      const sequence = [] as ([number, number] | [number, readonly [number, number]])[]
      let res: number | undefined = undefined

      const promise = firstValueFrom(
        source$.pipe(
          tap(x => sequence.push([0, x])),
          waitForJobSwitch(
            x =>
              of(x).pipe(
                tap(x => sequence.push([1, x])),
                delay(1000),
                tap(x => sequence.push([2, x])),
                map(() => x + 100),
              ),
            (m, x) => [x, m] as const,
          ),
          tap(x => sequence.push([3, x])),
          tap(([x]) => (res = x)),
          toArray(),
        ),
      )
      clock.tick(500)
      expect(res).to.equal(undefined)
      clock.tick(600)
      expect(res).to.equal(30)
      expect(await promise).to.deep.equal([[30, 130]])
      expect(sequence).to.deep.equal([
        [0, 10],
        [1, 10],
        [0, 20],
        [1, 20],
        [0, 30],
        [1, 30],
        [2, 30],
        [3, [30, 130]],
      ])
    }),
  )

  it(
    'Should wait for the job to finish before passing projected value [switch][async]',
    fakeSchedulers(async () => {
      const source$ = interval(100).pipe(
        map(x => 10 * (x + 1)),
        take(3),
      )
      const sequence = [] as ([number, number] | [number, readonly [number, number]])[]
      let res: number | undefined = undefined

      const promise = firstValueFrom(
        source$.pipe(
          tap(x => sequence.push([0, x])),
          waitForJobSwitch(
            x =>
              of(x).pipe(
                tap(x => sequence.push([1, x])),
                delay(1000),
                tap(x => sequence.push([2, x])),
                map(() => x + 100),
              ),
            (m, x) => [x, m] as const,
          ),
          tap(x => sequence.push([3, x])),
          tap(([x]) => (res = x)),
          toArray(),
        ),
      )
      clock.tick(500)
      expect(res).to.equal(undefined)
      clock.tick(600 + 300)
      expect(res).to.equal(30)
      expect(await promise).to.deep.equal([[30, 130]])
      expect(sequence).to.deep.equal([
        [0, 10],
        [1, 10],
        [0, 20],
        [1, 20],
        [0, 30],
        [1, 30],
        [2, 30],
        [3, [30, 130]],
      ])
    }),
  )

  it(
    'Should wait for the job to finish before passing projected value [exhaust][sync]',
    fakeSchedulers(async () => {
      const source$ = from([10, 20, 30])
      const sequence = [] as ([number, number] | [number, readonly [number, number]])[]
      let res: number | undefined = undefined

      const promise = firstValueFrom(
        source$.pipe(
          tap(x => sequence.push([0, x])),
          waitForJobExhaust(
            x =>
              of(x).pipe(
                tap(x => sequence.push([1, x])),
                delay(1000),
                tap(x => sequence.push([2, x])),
                map(() => x + 100),
              ),
            (m, x) => [x, m] as const,
          ),
          tap(x => sequence.push([3, x])),
          tap(([x]) => (res = x)),
          toArray(),
        ),
      )
      clock.tick(500)
      expect(res).to.equal(undefined)
      clock.tick(600)
      expect(res).to.equal(10)
      expect(await promise).to.deep.equal([[10, 110]])
      expect(sequence).to.deep.equal([
        [0, 10],
        [1, 10],
        [0, 20],
        [0, 30],
        [2, 10],
        [3, [10, 110]],
      ])
    }),
  )

  it(
    'Should wait for the job to finish before passing projected value [exhaust][async]',
    fakeSchedulers(async () => {
      const source$ = interval(100).pipe(
        map(x => 10 * (x + 1)),
        take(3),
      )
      const sequence = [] as ([number, number] | [number, readonly [number, number]])[]
      let res: number | undefined = undefined

      const promise = firstValueFrom(
        source$.pipe(
          tap(x => sequence.push([0, x])),
          waitForJobExhaust(
            x =>
              of(x).pipe(
                tap(x => sequence.push([1, x])),
                delay(1000),
                tap(x => sequence.push([2, x])),
                map(() => x + 100),
              ),
            (m, x) => [x, m] as const,
          ),
          tap(x => sequence.push([3, x])),
          tap(([x]) => (res = x)),
          toArray(),
        ),
      )
      clock.tick(500)
      expect(res).to.equal(undefined)
      clock.tick(600 + 300)
      expect(res).to.equal(10)
      expect(await promise).to.deep.equal([[10, 110]])
      expect(sequence).to.deep.equal([
        [0, 10],
        [1, 10],
        [0, 20],
        [0, 30],
        [2, 10],
        [3, [10, 110]],
      ])
    }),
  )
})
