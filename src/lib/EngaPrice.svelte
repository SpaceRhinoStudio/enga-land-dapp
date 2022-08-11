<script lang="ts">
  import _ from 'lodash'

  import { delay, filter, of, timeout } from 'rxjs'
  import { __$ } from './shared/locales'
  import { engaPrice$ } from './observables/enga/enga-price'
  import { noSentinelOrUndefined } from './shared/utils/no-sentinel-or-undefined'
  import WithLoading from './shared/WithLoading.svelte'
  import { parsePPM } from './operators/web3/ppm'
  import { SeedSale } from './services/seedsale'
  import { PreSale } from './services/presale'
  import { fade } from 'svelte/transition'

  const _engaPrice$ = engaPrice$.pipe(
    filter(noSentinelOrUndefined),
    timeout({ first: 6000, with: () => of(null) }),
    delay(2000),
  )
  const seedSalePricePPM$ = SeedSale.exchangeRatePPM$
  const seedSalePrice$ = seedSalePricePPM$.pipe(parsePPM)
  const preSalePricePPM$ = PreSale.exchangeRatePPM$
  const preSalePrice$ = preSalePricePPM$.pipe(parsePPM)
</script>

{#if $_engaPrice$ !== null}
  <div transition:fade>
    <WithLoading
      data={$_engaPrice$}
      predicate={_.negate(_.isUndefined)}
      className={{
        container: 'text-right w-max whitespace-nowrap',
      }}>
      <span slot="before">1 ENGA:</span>
      <span slot="data" class="text-yellow-400">
        ${_.isNull($_engaPrice$)
          ? $__$?.main.notAvailable
          : $seedSalePricePPM$ && $preSalePricePPM$
          ? `${$seedSalePrice$} ~ $${$preSalePrice$}`
          : $_engaPrice$}
      </span>
    </WithLoading>
  </div>
{/if}
