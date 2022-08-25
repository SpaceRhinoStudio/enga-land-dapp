import { config } from '$lib/configs'
import type { TypedEvent, TypedEventFilter } from 'engaland_fundraising_app/typechain/common'
import type { Contract } from 'ethers'
import _ from 'lodash'
import {
  combineLatest,
  from,
  map,
  mergeAll,
  mergeMap,
  Observable,
  of,
  switchMap,
  toArray,
} from 'rxjs'
import { switchSome } from '../pass-undefined'

//FIX: catch errors
export function safeQueryFilter<
  // T extends Contract,
  _EventArgsArray extends unknown[],
  _EventArgsObject,
>(
  contract: Contract,
  filter: TypedEventFilter<_EventArgsArray, _EventArgsObject>,
  start: string | number,
  end: string | number,
): Observable<TypedEvent<_EventArgsArray & _EventArgsObject>[]> {
  return of(contract.provider).pipe(
    switchSome(
      switchMap(x =>
        combineLatest({
          start: _.isNumber(start) ? of(start) : x.getBlock(start).then(x => x.number),
          end: _.isNumber(end) ? of(end) : x.getBlock(end).then(x => x.number),
        }),
      ),
      map(({ start, end }) => {
        const blockNumbers: { start: number; end: number }[] = []
        let _start = start
        let _end = end
        do {
          if (end - _start > config.logQueryMaximumBlockRange - 1) {
            _end = _start + config.logQueryMaximumBlockRange - 1
          } else {
            _end = end
          }
          blockNumbers.push({ start: _start, end: _end })
          _start = _end + 1
        } while (end === _start)
        return blockNumbers
      }),
      switchMap(blockNumbers => {
        const catchError = _.throttle(e => {
          console.warn('QueryFilter failed', e)
          return []
        }, 5000)
        return from(blockNumbers).pipe(
          mergeMap(
            ({ start, end }) =>
              contract.queryFilter(filter, start, end).catch(catchError) as Promise<
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
