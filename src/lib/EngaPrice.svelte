<script lang="ts">
  import _ from 'lodash'

  import { filter, of, timeout } from 'rxjs'
  import { __$ } from './shared/locales'
  import {
    engaPrice$,
    engaPriceFromPreSalePPM$,
    engaPriceFromSeedSalePPM$,
    parsePPM,
  } from './observables/enga-price'
  import { noSentinelOrUndefined } from './utils/no-sentinel-or-undefined'
  import WithLoading from './shared/WithLoading.svelte'

  const _engaPrice$ = engaPrice$.pipe(
    filter(noSentinelOrUndefined),
    timeout({ first: 6000, with: () => of(null) }),
  )
  const seedSalePrice$ = engaPriceFromSeedSalePPM$.pipe(parsePPM)
  const preSalePrice$ = engaPriceFromPreSalePPM$.pipe(parsePPM)
</script>

<WithLoading
  data={$_engaPrice$}
  predicate={_.negate(_.isUndefined)}
  className={{
    container: 'text-right',
  }}>
  <span slot="before">1 ENGA:</span>
  <span slot="data" class="text-yellow-400">
    ${_.isNull($_engaPrice$)
      ? $__$?.main.notAvailable
      : $engaPriceFromSeedSalePPM$ && $engaPriceFromPreSalePPM$
      ? `${$seedSalePrice$} ~ $${$preSalePrice$}`
      : $_engaPrice$}
  </span>
</WithLoading>
