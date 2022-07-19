import _ from 'lodash'

export function sanitizeNumbers(str: string): string {
  return _.isString(str) ? str : ''
}
export function onlyNumbers(str: string): string {
  return sanitizeNumbers(str).replace(/[^0-9.]/g, '')
}
