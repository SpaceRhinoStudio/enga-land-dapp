import { mapNil } from '$lib/operators/pass-undefined'
import { noNil } from '$lib/shared/utils/no-sentinel-or-undefined'
import { keysOf } from '$lib/shared/utils/type-safe'
import { Nil, Some, SomeMembers } from '$lib/types'
import { isEnumMember } from '$lib/utils/enum'
import _ from 'lodash'
import { catchError, Observable, of, OperatorFunction, pipe, switchMap, throwError } from 'rxjs'

export enum Web3Errors {
  // EIP-1193

  /** @description [4001] The user rejected the request. */
  REJECTED = '4001',

  /** @description [4100] The requested method and/or account has not been authorized by the user. */
  UNAUTHORIZED = '4100',

  /** @description [4200] The Provider does not support the requested method. */
  UNSUPPORTED_METHOD = '4200',

  /** @description [4900] The Provider is disconnected from all chains. */
  DISCONNECTED = '4900',

  /** @description [4901] The Provider is not connected to the requested chain. */
  CHAIN_DISCONNECTED = '4901',

  // EIP-1474

  /** @description [-32700] Invalid JSON */
  PARSE_ERROR = '-32700',

  /** @description [-32600] JSON is not a valid request object */
  INVALID_REQUEST = '-32600',

  /** @description [-32601] Method does not exist */
  METHOD_NOT_FOUND = '-32601',

  /** @description [-32602] Invalid method parameters */
  INVALID_PARAMS = '-32602',

  /** @description [-32603] Internal JSON-RPC error */
  INTERNAL_ERROR = '-32603',

  /** @description [-32000] Missing or invalid parameters */
  INVALID_INPUT = '-32000',

  /** @description [-32001] Requested resource not found */
  RESOURCE_NOT_FOUND = '-32001',

  /** @description [-32002] Requested resource not available */
  RESOURCE_UNAVAILABLE = '-32002',

  /** @description [-32003] Transaction creation failed */
  TRANSACTION_REJECTED = '-32003',

  /** @description [-32004] Method is not implemented */
  METHOD_NOT_IMPLEMENTED = '-32004',

  /** @description [-32005] Request exceeds defined limit */
  RATE_LIMIT_EXCEEDED = '-32005',

  /** @description [-32006] Version of JSON-RPC protocol is not supported */
  UNSUPPORTED_RPC_VERSION = '-32006',

  // NOT STANDARD

  /** @description [4902] Requested ChainID does not exist on the current configuration of provider */
  UNKNOWN_CHAIN = '4902',
}

export const inferWeb3Error = (error: unknown): Web3Errors | undefined => {
  if (isWeb3Error(error)) {
    return error
  }
  const code = String(_.get(error, 'code'))
  const res = keysOf(Web3Errors).find(k => code === Web3Errors[k] || code === k)
  if (res) {
    const errRes = Web3Errors[res]
    return errRes === Web3Errors.INTERNAL_ERROR
      ? inferWeb3Error(_.get(error, 'data')) ??
          inferWeb3Error(_.get(error, 'data.originalError')) ??
          errRes
      : errRes
  }
  if (String(error).includes('failed to meet quorum')) {
    return Web3Errors.DISCONNECTED
  }
  return undefined
}
export const nameOfWeb3Error = (x: Web3Errors): string =>
  keysOf(Web3Errors)
    .map(k => (x === Web3Errors[k] ? k : null))
    .find(noNil)!

export const isWeb3Error = isEnumMember(Web3Errors)

export function mapNilToWeb3Error<T>(): OperatorFunction<
  T,
  | Some<T>
  | (Nil extends T
      ? Web3Errors.INVALID_PARAMS | Web3Errors.RESOURCE_NOT_FOUND
      : null extends T
      ? Web3Errors.INVALID_PARAMS
      : undefined extends T
      ? Web3Errors.RESOURCE_NOT_FOUND
      : never)
> {
  //@ts-ignore it's obvious but TS is dumb
  return pipe(
    mapNil(x => (_.isUndefined(x) ? Web3Errors.RESOURCE_NOT_FOUND : Web3Errors.INVALID_PARAMS)),
  )
}

export type Web3ErrorObject<E extends Web3Errors = Web3Errors> = {
  code: E
  message: string
}

function makeNilErrorWith(subjectName: string) {
  return function <E extends Web3Errors.RESOURCE_NOT_FOUND | Web3Errors.INVALID_PARAMS>(
    error: E,
  ): Observable<never> {
    return throwError(() => ({
      code: error,
      message: `${subjectName} ${
        error === Web3Errors.RESOURCE_NOT_FOUND
          ? 'not available'
          : error === Web3Errors.INVALID_PARAMS
          ? 'not valid'
          : 'is wrong'
      }`,
    }))
  }
}

/**@throws {Web3ErrorObject<Web3Errors.RESOURCE_NOT_FOUND | Web3Errors.INVALID_PARAMS>} respective to resources being undefined or null */
export function switchSomeMembersOrWeb3Error<T>(
  subjectName: string,
): OperatorFunction<T, SomeMembers<T>> {
  const makeError = makeNilErrorWith(subjectName)
  return pipe(
    switchMap(x =>
      _.isNull(x)
        ? makeError(Web3Errors.INVALID_PARAMS)
        : _.isUndefined(x)
        ? makeError(Web3Errors.RESOURCE_NOT_FOUND)
        : !_.isArray(x)
        ? of(x as SomeMembers<T>)
        : x.some(_.isNull)
        ? makeError(Web3Errors.INVALID_PARAMS)
        : x.some(_.isUndefined)
        ? makeError(Web3Errors.RESOURCE_NOT_FOUND)
        : of(x as SomeMembers<T>),
    ),
  )
}
export type Web3ErrorWithPayload = readonly [status: Web3Errors, payload: Error]

export function catchWeb3ErrorWithPayload<T>(): OperatorFunction<T, T | Web3ErrorWithPayload> {
  return catchError(e => of([inferWeb3Error(e) ?? Web3Errors.INTERNAL_ERROR, e as Error] as const))
}

export function throwIfWeb3ErrorWithPayload<S, P>(): OperatorFunction<
  readonly [status: S, payload: P] | Web3ErrorWithPayload,
  readonly [status: S, payload: P]
> {
  return pipe(
    switchMap(([status, payload]) =>
      isWeb3Error(status)
        ? throwError(() => payload as Error)
        : of([status, payload as P] as const),
    ),
  )
}
