import { mapNil } from '$lib/operators/pass-undefined'
import { noNil } from '$lib/shared/utils/no-sentinel-or-undefined'
import { keysOf } from '$lib/shared/utils/type-safe'
import { ActionStatus, Some } from '$lib/types'
import { isEnumMember } from '$lib/utils/enum'
import _ from 'lodash'
import { catchError, of, OperatorFunction, pipe } from 'rxjs'

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
  const code = String(_.get(error, 'code'))
  const res = keysOf(Web3Errors).find(k => code === Web3Errors[k])
  if (res) {
    const errRes = Web3Errors[res]
    return errRes === Web3Errors.INTERNAL_ERROR
      ? inferWeb3Error(_.get(error, 'data.originalError')) ?? errRes
      : errRes
  }
  return undefined
}
export const nameOfWeb3Error = (x: Web3Errors): string =>
  keysOf(Web3Errors)
    .map(k => (x === Web3Errors[k] ? k : null))
    .find(noNil)!

export function handleCommonProviderErrors<T>(): OperatorFunction<
  T,
  Some<T> | Web3Errors.REJECTED | ActionStatus.FAILURE | Web3Errors.INVALID_PARAMS
> {
  return pipe(
    catchError(e => {
      const web3Error = inferWeb3Error(e)
      if (web3Error === Web3Errors.REJECTED) {
        return of(web3Error)
      }
      return of(ActionStatus.FAILURE as const)
    }),
    mapNil<T | Web3Errors.REJECTED | ActionStatus.FAILURE, Web3Errors.INVALID_PARAMS>(
      () => Web3Errors.INVALID_PARAMS as const,
    ),
  )
}

export const isWeb3Error = isEnumMember(Web3Errors)
