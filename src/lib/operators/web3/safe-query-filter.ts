import { config } from '$lib/configs'
import type { TypedEvent, TypedEventFilter } from 'engaland_fundraising_app/typechain/common'
import type { Contract } from 'ethers'
import _ from 'lodash'
import {
  from,
  map,
  merge,
  mergeAll,
  mergeMap,
  Observable,
  of,
  reduce,
  switchMap,
  toArray,
} from 'rxjs'
import { logOp } from '../log'
import { switchSome } from '../pass-undefined'

export function safeQueryFilter<
  T extends Contract,
  _EventArgsArray extends unknown[],
  _EventArgsObject,
>(
  contract: T,
  filter: TypedEventFilter<_EventArgsArray, _EventArgsObject>,
  start: string | number,
  end: string | number,
): Observable<TypedEvent<_EventArgsArray & _EventArgsObject>[]> {
  return of(contract.provider).pipe(
    switchSome(
      switchMap(x =>
        merge(
          _.isNumber(start)
            ? of({ start })
            : from(x.getBlock(start).then(x => ({ start: x.number }))),
          _.isNumber(end) ? of({ end }) : from(x.getBlock(end).then(x => ({ end: x.number }))),
        ).pipe(reduce((acc, curr) => ({ ...acc, ...curr }), {} as { start: number; end: number })),
      ),
      map(({ start, end }) => {
        const res: { start: number; end: number }[] = []
        let _start = start
        let _end = end
        do {
          if (end - _start > config.logQueryMaximumBlockRange - 1) {
            _end = _start + config.logQueryMaximumBlockRange - 1
          } else {
            _end = end
          }
          res.push({ start: _start, end: _end })
          _start = _end + 1
        } while (end === _start)
        return res
      }),
      logOp('doin queryfilter'),
      switchMap(blockNumbers => {
        const catchError = _.throttle(e => {
          console.warn('QueryFilter failed', e)
          return []
        }, 5000)
        return from(blockNumbers).pipe(
          logOp('doin queryfilter'),
          mergeMap(
            ({ start, end }) =>
              contract!.queryFilter(filter, start, end).catch(catchError) as Promise<
                TypedEvent<_EventArgsArray & _EventArgsObject>[]
              >,
          ),
          mergeAll(),
          toArray(),
        )
      }),
    ),
  )
}
