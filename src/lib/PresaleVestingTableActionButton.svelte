<script lang="ts">
  import { firstValueFrom, map, tap } from 'rxjs'
  import { ControllerContract$ } from '../contracts/fundraising-contracts'
  import Button from './Button.svelte'
  import { __$ } from './locales'
  import { preSaleStatus$ } from './observables/pre-sale/status'
  import { requestRefund } from './operators/pre-sale/request-refund'
  import { requestRelease } from './operators/pre-sale/request-release'
  import { PreSaleStatus } from './operators/pre-sale/status'
  import SvgIcon from './SVGIcon.svelte'
  import RestrictedIcon from '../assets/icons/vuesax-linear-group.svg'
  import type { VestingType } from './observables/pre-sale/signers-vestings'

  export let data: VestingType

  //REVIEW vvv
  //TODO: not all vestings are created under current presale contract as they could be created by either PrivateSale or SeedSale
  //REVIEW ^^^
  let canRelease = false
  $: $preSaleStatus$ === PreSaleStatus.Closed && data.release.gt(0)
  let canRevoke = false
  $: $preSaleStatus$ === PreSaleStatus.Refunding
  let isLoading = false
</script>

<Button
  job={async () => {
    if (canRelease) {
      isLoading = true
      return firstValueFrom(
        ControllerContract$.pipe(
          requestRelease(data.vestId),
          map(() => undefined),
          tap(() => (isLoading = false)),
        ),
      )
    }
    if (canRevoke) {
      isLoading = true
      return firstValueFrom(
        ControllerContract$.pipe(
          requestRefund(data.saleContractAddress, data.vestId),
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
