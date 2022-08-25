import _ from 'lodash'

export const isEnumMember =
  <T>(source: Record<string | number, T>) =>
  (x: unknown): x is T => {
    return _.values(source).findIndex(e => String(e) === String(x)) !== -1
  }
