<script lang="ts">
  import _ from 'lodash'
  import { fade, fly, slide } from 'svelte/transition'
  import Button from './shared/Button.svelte'
  import Card from './Card.svelte'
  import { __$ } from './shared/locales'
  import { PreSaleStatus } from './operators/pre-sale/status'
  import SvgIcon from './shared/SVGIcon.svelte'
  import WithLoading from './shared/WithLoading.svelte'
  import EngaIcon from './shared/assets/icons/enga-icon.svg'
  import BusdIcon from './shared/assets/icons/dai-icon.svg'
  import InfoIcon from './shared/assets/icons/vuesax-linear-info-circle.svg'
  import TickIcon from './shared/assets/icons/vuesax-linear-tick-circle.svg'
  import FlashIcon from './shared/assets/icons/vuesax-linear-flash.svg'
  import RestrictedIcon from './shared/assets/icons/vuesax-linear-group.svg'
  import TickSquareIcon from './shared/assets/icons/vuesax-linear-tick-square.svg'
  import TickSquareEmptyIcon from './shared/assets/icons/vuesax-linear-tick-square-empty.svg'
  import {
    ControllerContract$,
    EngaTokenContract$,
    PreSaleContract$,
    PreSaleTargetERC20Collateral$,
    SeedSaleContract$,
    SeedSaleTargetERC20Collateral$,
  } from '../contracts/fundraising-contracts'
  import { isSentinel } from './shared/contexts/empty-sentinel'
  import { preSaleStatus$ } from './observables/pre-sale/status'
  import { signerAddress$ } from './observables/selected-web3-provider'
  import {
    BehaviorSubject,
    combineLatest,
    distinctUntilChanged,
    filter,
    firstValueFrom,
    map,
    of,
    ReplaySubject,
    shareReplay,
    startWith,
    switchMap,
    take,
    tap,
  } from 'rxjs'
  import { parseEther } from './utils/parse-ether'
  import { signerApprove } from './operators/web3/approve'
  import { preSaleRequestContribute } from './operators/pre-sale/request-contribute'
  import { controlStreamPayload } from './shared/operators/control-stream-payload'
  import { utils } from 'ethers'
  import {
    engaPriceFromPreSalePPM$,
    engaPriceFromSeedSalePPM$,
    engaPricePPM$,
    parsePPM,
  } from './observables/enga-price'
  import { BigNumber } from 'ethers'
  import { config } from './configs'
  import { noNil, noSentinelOrUndefined } from './shared/utils/no-sentinel-or-undefined'
  import { preSaleSignersVestings$ } from './observables/pre-sale/signers-vestings'
  import { preSaleTargetCollateralAllowance$ } from './observables/pre-sale/target-collateral-allowance'
  import { passNil } from './operators/pass-undefined'
  import { withUpdatesFrom } from './operators/with-updates-from'
  import {
    termsAndConditionsAgreements$,
    termsAndConditionsAgreementsController$,
  } from './observables/terms-and-condition-agreement'
  import { flashToast$, ToastType } from './shared/contexts/flash-toast'
  import SwapInputRow from './SwapInputRow.svelte'
  import { type InputControl } from './Input.svelte'
  import { handleDerivedInputs } from './helpers/handle-drived-inputs'
  import { useCreateControl } from './helpers/create-control'
  import { seedSaleStatus$ } from './observables/seed-sale/status'
  import { SeedSaleStatus } from './operators/seed-sale/status'
  import { seedSaleSignersVestings$ } from './observables/seed-sale/signers-vestings'
  import { seedSaleTargetCollateralAllowance$ } from './observables/seed-sale/target-collateral-allowance'
  import { seedSaleRequestContribute } from './operators/seed-sale/request-contribute'

  export let sale: 'preSale' | 'seedSale'

  $: isFunding =
    sale === 'preSale'
      ? $preSaleStatus$ === PreSaleStatus.Funding
      : $seedSaleStatus$ === SeedSaleStatus.Funding
  $: isWhitelisted = true //TODO: implement
  $: canContribute = !!$signerAddress$?.length && isFunding && isWhitelisted

  const baseControl$ = useCreateControl<InputControl>({ omit: ['LastKeyStroke'] })
  const quoteControl$ = useCreateControl<InputControl>({ omit: ['LastKeyStroke'] })
  const shouldApprove$ = new ReplaySubject<Partial<{ Should: boolean; Loading: boolean }>>()
  let waitingForTx = false
  const hasAgreed$ = termsAndConditionsAgreements$
  const successfulContribution$ = new ReplaySubject<{ Success: true }>()

  const { reset } = handleDerivedInputs(
    { base: baseControl$, quote: quoteControl$ },
    {
      base: {
        quote: switchMap(x =>
          sale$.pipe(
            switchMap(sale =>
              sale === 'preSale' ? engaPriceFromPreSalePPM$ : engaPriceFromSeedSalePPM$,
            ),
            filter(noSentinelOrUndefined),
            filter(noNil),
            map(price => parseEther(x).mul(BigNumber.from(config.PPM).pow(2)).div(price)),
            map(x =>
              (Number(utils.formatEther(x)) / config.PPM).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              }),
            ),
          ),
        ),
      },
      quote: {
        base: switchMap(x =>
          sale$.pipe(
            switchMap(sale =>
              sale === 'preSale' ? engaPriceFromPreSalePPM$ : engaPriceFromSeedSalePPM$,
            ),
            filter(noSentinelOrUndefined),
            filter(noNil),
            map(price => parseEther(x).mul(price)),
            map(x =>
              (Number(utils.formatEther(x)) / config.PPM).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              }),
            ),
          ),
        ),
      },
    },
  )

  $: signersVestings$ = sale === 'preSale' ? preSaleSignersVestings$ : seedSaleSignersVestings$

  successfulContribution$
    .pipe(
      controlStreamPayload('Success'),
      filter(x => x === true),
    )
    .subscribe(() => {
      reset()
      waitingForTx = true
      signersVestings$.pipe(take(1)).subscribe(() => (waitingForTx = false))
    })

  const sale$ = new BehaviorSubject(sale)
  $: sale$.next(sale)

  sale$
    .pipe(
      switchMap(sale =>
        sale === 'preSale' ? preSaleTargetCollateralAllowance$ : seedSaleTargetCollateralAllowance$,
      ),
      passNil(
        withUpdatesFrom(
          quoteControl$.pipe(controlStreamPayload('Value'), distinctUntilChanged(), startWith('0')),
        ),
        map(([allowance, x]) => allowance.lt(parseEther(x))),
      ),
      map(x => (_.isUndefined(x) ? { Loading: true } : { Loading: false, Should: x ?? false })),
      shareReplay(1),
    )
    .subscribe(x => shouldApprove$.next(x))

  const isLoadingAgreement$ = termsAndConditionsAgreementsController$.pipe(
    controlStreamPayload('Loading'),
  )

  const handleAgree = () => {
    //TODO: test if this is reactive after implementing toast stuff
    if (_.isUndefined($hasAgreed$) || $isLoadingAgreement$) {
      return
    }
    if ($hasAgreed$) {
      __$.subscribe(__ =>
        flashToast$.next({
          message: __.presale.errors.cannotRemoveAgreement,
          level: ToastType.error,
        }),
      )
      return
    }
    termsAndConditionsAgreementsController$.next({
      Request: true,
    })
  }

  const collateralTicker$ = sale$.pipe(
    switchMap(sale =>
      sale === 'preSale' ? PreSaleTargetERC20Collateral$ : SeedSaleTargetERC20Collateral$,
    ),
    passNil(
      switchMap(x => x.name()),
      map(x => x.toUpperCase()),
    ),
  )

  const handleApproveOrSwap$ = combineLatest({
    shouldApprove: shouldApprove$.pipe(controlStreamPayload('Should'), distinctUntilChanged()),
    value: quoteControl$.pipe(controlStreamPayload('Value'), distinctUntilChanged()),
  }).pipe(
    map(({ shouldApprove, value }) => {
      if (shouldApprove && value) {
        return sale$.pipe(
          switchMap(sale =>
            sale === 'preSale'
              ? combineLatest([PreSaleTargetERC20Collateral$, PreSaleContract$])
              : combineLatest([SeedSaleTargetERC20Collateral$, SeedSaleContract$]),
          ),
          take(1),
          tap(() => (waitingForTx = true)),
          signerApprove(value),
          tap(
            x =>
              x &&
              shouldApprove$.next({
                Loading: true,
              }),
          ),
          tap(() => (waitingForTx = false)),
        )
      } else if (value) {
        return sale$.pipe(
          switchMap(sale =>
            sale === 'preSale'
              ? ControllerContract$.pipe(
                  tap(() => (waitingForTx = true)),
                  preSaleRequestContribute(value),
                  take(1),
                  tap(() => (waitingForTx = false)),
                  tap(
                    x =>
                      x &&
                      successfulContribution$.next({
                        Success: true,
                      }),
                  ),
                )
              : SeedSaleContract$.pipe(
                  tap(() => (waitingForTx = true)),
                  seedSaleRequestContribute(value),
                  take(1),
                  tap(() => (waitingForTx = false)),
                  tap(
                    x =>
                      x &&
                      successfulContribution$.next({
                        Success: true,
                      }),
                  ),
                ),
          ),
        )
      }
      return of(false)
    }),
    map(x => () => firstValueFrom(x.pipe(map(() => undefined)))),
    startWith(_.noop),
  )

  const exchangeRate$ = sale$.pipe(
    switchMap(sale => (sale === 'preSale' ? engaPriceFromPreSalePPM$ : engaPriceFromSeedSalePPM$)),
    parsePPM,
  )
</script>

<Card
  className={{
    container: 'text-sm sm:w-screen flex flex-col',
    wrapper: 'relative grow min-h-[theme(spacing.20)]',
  }}>
  <span slot="header">{$__$?.presale.contribution.title}</span>
  {#if canContribute}
    <div
      transition:slide
      class="flex flex-col space-y-7 md:h-full transition-all duration-1000 h-full {canContribute
        ? 'opacity-100'
        : 'opacity-0'}">
      <SwapInputRow
        icon={BusdIcon}
        control$={quoteControl$}
        contract$={sale === 'preSale'
          ? PreSaleTargetERC20Collateral$
          : SeedSaleTargetERC20Collateral$}
        isBase={false}>
        <span slot="title">{$__$?.presale.contribution.quote}</span>
      </SwapInputRow>
      <SwapInputRow icon={EngaIcon} control$={baseControl$} contract$={EngaTokenContract$} isBase>
        <span slot="title">{$__$?.presale.contribution.base}</span>
      </SwapInputRow>
      <div class="flex justify-between flex-col space-y-4 md:flex-row md:space-y-0">
        <div class="flex space-x-1 items-start">
          <SvgIcon Icon={InfoIcon} width="1.125rem" height="1.125rem" />
          <span>{$__$?.presale.contribution.rate}</span>
        </div>
        <span>
          <WithLoading data={[$exchangeRate$, $collateralTicker$]} passSentinel>
            <span slot="before">1 ENGA:</span>
            <span slot="data" class="text-yellow-400">
              <span>
                {isSentinel($exchangeRate$) ? $__$?.main.notAvailable : $exchangeRate$}
              </span>
              <span>{$collateralTicker$}</span>
            </span>
          </WithLoading>
        </span>
      </div>
      <div class="md:flex md:grow items-end w-full">
        <div
          class="flex flex-col space-y-7 md:flex-row md:space-y-0 md:justify-between md:items-center text-xs md:grow children:grow md:pb-2">
          <div class="flex space-x-2 items-center cursor-pointer" on:click={handleAgree}>
            <WithLoading
              data={_.isUndefined($hasAgreed$) || $isLoadingAgreement$}
              predicate={e => !e}>
              <svelte:fragment slot="data">
                {#if !!$hasAgreed$}
                  <SvgIcon Icon={TickSquareIcon} width="1.25rem" height="1.25rem" />
                {/if}
                {#if !$hasAgreed$}
                  <SvgIcon Icon={TickSquareEmptyIcon} width="1.25rem" height="1.25rem" />
                {/if}
              </svelte:fragment>
              <span slot="after" class="text-text-secondary text-2xs cursor-pointer">
                {$__$?.presale.contribution.termsNotice}
              </span>
            </WithLoading>
          </div>
          <Button
            job={$handleApproveOrSwap$}
            disabled={!$hasAgreed$ ||
              !!$quoteControl$?.Errors?.length ||
              !$quoteControl$?.Value?.length}
            isLoading={_.isUndefined($shouldApprove$?.Should) ||
              $shouldApprove$?.Loading ||
              waitingForTx ||
              _.isUndefined($hasAgreed$) ||
              !!$isLoadingAgreement$}
            className="h-8 flex w-full md:w-20 relative items-center justify-center m-0 !border-0 {$shouldApprove$?.Should
              ? 'bg-yellow-700'
              : 'bg-secondary-700'}">
            {#if !$shouldApprove$?.Loading && !!$shouldApprove$?.Should && !!$hasAgreed$}
              <div
                in:fly={{ x: -50 }}
                out:fly={{ x: 50 }}
                class="absolute inset-0 flex justify-center gap-2 items-center">
                <SvgIcon Icon={TickIcon} width="1.125rem" height="1.125rem" />
                <span>
                  {$__$?.presale.contribution.approve.toUpperCase()}
                </span>
              </div>
            {/if}

            {#if !$shouldApprove$?.Loading && !$shouldApprove$?.Should && !!$hasAgreed$}
              <div
                in:fly={{ x: -50 }}
                out:fly={{ x: 50 }}
                class="absolute inset-0 flex justify-center gap-2 items-center">
                <SvgIcon Icon={FlashIcon} width="1.125rem" height="1.125rem" />
                <span>
                  {$__$?.presale.contribution.swap.toUpperCase()}
                </span>
              </div>
            {/if}

            {#if !$hasAgreed$}
              <div
                in:fly={{ x: -50 }}
                out:fly={{ x: 50 }}
                class="absolute inset-0 flex justify-center items-center">
                <SvgIcon
                  Icon={RestrictedIcon}
                  width="1.125rem"
                  height="1.125rem"
                  className={'hidden md:flex'} />
                <span class="md:hidden">
                  {$__$?.presale.errors.shouldAgree}
                </span>
              </div>
            {/if}
          </Button>
        </div>
      </div>
    </div>
  {/if}
  {#if !canContribute}
    <div transition:fade class="absolute inset-0 flex justify-center items-center h-full">
      {#if !$signerAddress$?.length && isFunding}
        <span>
          {$__$?.web3Provider.connect.connectButton.notConnected}
        </span>
      {/if}
      {#if !isFunding}
        <span>{$__$?.presale.contribution.unavailable}</span>
      {/if}
    </div>
  {/if}
</Card>
