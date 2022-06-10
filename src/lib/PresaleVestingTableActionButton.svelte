<script lang="ts">
  import { firstValueFrom, map, pipe, tap } from 'rxjs'
  import { ControllerContract$, SeedSaleContract$ } from '../contracts/fundraising-contracts'
  import Button from './Button.svelte'
  import { __$ } from './shared/locales'
  import { preSaleStatus$ } from './observables/pre-sale/status'
  import { preSaleRequestRefund } from './operators/pre-sale/request-refund'
  import { preSaleRequestRelease } from './operators/pre-sale/request-release'
  import { PreSaleStatus } from './operators/pre-sale/status'
  import SvgIcon from './shared/SVGIcon.svelte'
  import RestrictedIcon from './shared/assets/icons/vuesax-linear-group.svg'
  import type { VestingType } from './observables/pre-sale/signers-vestings'
  import { seedSaleRequestRelease } from './operators/seed-sale/request-release'
  import { releaseAmount } from './operators/pre-sale/release-amount'
  import Modal from './shared/Modal.svelte'
  import Card from './Card.svelte'
  import { screen$ } from './shared/helpers/media-queries'
  import cn from 'classnames'
  import WithCurrencyIcon from './WithCurrencyIcon.svelte'
  import _, { camelCase } from 'lodash'

  export let data: VestingType
  export let sale: 'preSale' | 'seedSale'

  $: canRelease =
    (sale === 'preSale' ? $preSaleStatus$ === PreSaleStatus.Closed : true) &&
    releaseAmount(data).gt(0)
  $: canRevoke = sale === 'preSale' && $preSaleStatus$ === PreSaleStatus.Refunding
  let toggle: () => void
</script>

{#if canRelease || canRevoke}
  <Button
    job={async () =>
      canRelease
        ? toggle()
        : canRevoke
        ? firstValueFrom(
            ControllerContract$.pipe(
              preSaleRequestRefund(data.vestId),
              map(() => undefined),
            ),
          )
        : undefined}
    disabled={!canRevoke && !canRelease}
    secondary
    className={'w-full justify-center flex'}>
    {#if canRevoke}
      {$__$?.presale.vestings.actions.revoke.toUpperCase()}
    {:else if canRelease}
      {$__$?.presale.vestings.actions.release.toUpperCase()}
    {/if}
  </Button>
{/if}

<Modal acceptExit bind:toggle>
  <Card
    className={{
      container: cn($screen$.isMobile && '!rounded-b-none'),
      wrapper: 'sm:w-96 max-w-full flex flex-col gap-5',
    }}>
    <span slot="header">{$__$.presale.vestings.actions.release}</span>
    <div class="flex flex-col gap-2">
      <span>{$__$.presale.vestings.actions.ableToRelease}:</span>
      <WithCurrencyIcon data={releaseAmount(data)} />
    </div>
    <div class="flex gap-4 children:w-full">
      <Button job={() => toggle()} danger>
        {$__$.userInteraction.confirmation.cancel}
      </Button>
      <Button
        disabled={!canRelease}
        job={() =>
          canRelease
            ? firstValueFrom(
                (sale === 'preSale'
                  ? ControllerContract$.pipe(preSaleRequestRelease(data.vestId))
                  : SeedSaleContract$.pipe(seedSaleRequestRelease(data.vestId))
                ).pipe(
                  map(() => undefined),
                  tap(toggle),
                ),
              )
            : undefined}
        className="px-10"
        active>
        {$__$.presale.vestings.actions.release}
      </Button>
    </div>
  </Card>
</Modal>

{#if !canRevoke && !canRelease}
  <SvgIcon Icon={RestrictedIcon} width={'1rem'} height={'1rem'} className={'my-0.5'} />
{/if}
