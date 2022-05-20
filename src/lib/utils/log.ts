import _ from 'lodash'

export function log<T>(input: T, message?: string | ((x: T) => string)): T {
  console.log(_.isFunction(message) ? message(input) : message, [input])
  return input
}
