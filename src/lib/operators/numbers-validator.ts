import { map, type OperatorFunction } from 'rxjs'
import { onlyNumbers } from '$lib/utils/sanitize-numbers'

export const NumbersValidatorOperator: OperatorFunction<string, boolean> = input =>
  input.pipe(
    map(input => {
      const sanitized = onlyNumbers(input)
      return sanitized.length > 0
    }),
  )
