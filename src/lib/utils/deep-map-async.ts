import _ from 'lodash'
import type { AsyncMapper } from '../types'

function resolveObject(source: any): Promise<any> {
  return _.isObject(source)
    ? Promise.all(_.entries(source).map(([k, v]) => Promise.resolve(v).then(res => [k, res]))).then(
        entries =>
          entries.reduce((acc, [k, v]) => {
            acc[k] = v
            return acc
          }, (_.isArray(source) ? [] : {}) as any),
      )
    : Promise.resolve(source)
}

//DEBUG: test
export function deepMapAsync(obj: unknown, asyncCallback: AsyncMapper): Promise<unknown> {
  return asyncCallback(obj).then(res =>
    _.isObject(res)
      ? resolveObject(
          //@ts-ignore
          (_.isArray(res) ? _.map : _.mapValues)(res, v => deepMapAsync(v, asyncCallback)),
        )
      : res,
  )
}
