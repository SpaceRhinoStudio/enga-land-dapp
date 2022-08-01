import _ from 'lodash'

/**
 * @description this function is used to convert a JS date (milliseconds in number format, date object, or date constructor string) to Solidity standard time.
 */
export function solTime(time?: Date | number | string): number {
  let res = 0
  if (_.isDate(time)) {
    res = Number(time)
  } else if (_.isUndefined(time)) {
    res = Date.now()
  } else {
    res = Number(new Date(time))
  }
  return Math.floor(res / 1000)
}
