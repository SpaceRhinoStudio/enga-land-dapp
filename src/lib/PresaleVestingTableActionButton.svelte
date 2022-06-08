<script lang="ts">
  import { firstValueFrom, map, pipe, tap } from 'rxjs'
  import { ControllerContract$, SeedSaleContract$ } from '../contracts/fundraising-contracts'
  import Button from './Button.svelte'
  import { __$ } from './locales'
  import { preSaleStatus$ } from './observables/pre-sale/status'
  import { preSaleRequestRefund } from './operators/pre-sale/request-refund'
  import { preSaleRequestRelease } from './operators/pre-sale/request-release'
  import { PreSaleStatus } from './operators/pre-sale/status'
  import SvgIcon from './SVGIcon.svelte'
  import RestrictedIcon from '../assets/icons/vuesax-linear-group.svg'
  import type { VestingType } from './observables/pre-sale/signers-vestings'
  import { seedSaleRequestRelease } from './operators/seed-sale/request-release'

  export let data: VestingType
  export let sale: 'preSale' | 'seedSale'

  $: canRelease =
    (sale === 'preSale' ? $preSaleStatus$ === PreSaleStatus.Closed : true) && data.release.gt(0)
  $: canRevoke = sale === 'preSale' && $preSaleStatus$ === PreSaleStatus.Refunding
  let isLoading = false
</script>

<Button
  job={async () => {
    if (canRelease) {
      isLoading = true
      return firstValueFrom(
        (sale === 'preSale'
          ? ControllerContract$.pipe(preSaleRequestRelease(data.vestId))
          : SeedSaleContract$.pipe(seedSaleRequestRelease(data.vestId))
        ).pipe(
          map(() => undefined),
          tap(() => (isLoading = false)),
        ),
      )
    }
    if (canRevoke) {
      isLoading = true
      return firstValueFrom(
        ControllerContract$.pipe(
          preSaleRequestRefund(data.vestId),
          map(() => undefined),
          tap(() => (isLoading = false)),
        ),
      )
    }
    return
  }}
  disabled={!canRevoke && !canRelease}
  {isLoading}
  secondary
  className={'w-full justify-center flex'}>
  {#if canRevoke}
    {$__$?.presale.vestings.actions.revoke.toUpperCase()}
  {:else if canRelease}
    {$__$?.presale.vestings.actions.release.toUpperCase()}
  {:else}
    <SvgIcon Icon={RestrictedIcon} width={'1rem'} height={'1rem'} className={'my-0.5'} />
  {/if}
</Button>
