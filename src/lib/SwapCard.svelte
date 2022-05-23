<script lang="ts">
  import _ from 'lodash'
  import { fade } from 'svelte/transition'
  import Button from './Button.svelte'
  import Card from './Card.svelte'
  import Fade from './Fade.svelte'
  import { __$ } from './locales'
  import { PreSaleStatus } from './operators/pre-sale/status'
  import SvgIcon from './SVGIcon.svelte'
  import WithLoading from './WithLoading.svelte'
  import EngaIcon from '../assets/icons/enga-icon.svg'
  import BusdIcon from '../assets/icons/busd-icon.svg'
  import InfoIcon from '../assets/icons/vuesax-linear-info-circle.svg'
  import TickIcon from '../assets/icons/vuesax-linear-tick-circle.svg'
  import FlashIcon from '../assets/icons/vuesax-linear-flash.svg'
  import RestrictedIcon from '../assets/icons/vuesax-linear-group.svg'
  import TickSquareIcon from '../assets/icons/vuesax-linear-tick-square.svg'
  import TickSquareEmptyIcon from '../assets/icons/vuesax-linear-tick-square-empty.svg'
  import {
    ControllerContract$,
    EngaTokenContract$,
    PreSaleContract$,
    PreSaleTargetERC20Collateral$,
  } from '../contracts/fundraising-contracts'
  import { isSentinel } from './contexts/empty-sentinel'
  import { preSaleStatus$ } from './observables/pre-sale/status'
  import { signerAddress$ } from './observables/selected-web3-provider'
  import {
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
  import { requestContribute } from './operators/pre-sale/request-contribute'
  import { controlStreamPayload } from './operators/control-stream-payload'
  import { formatEther } from 'ethers/lib/utils'
  import { engaPrice$, engaPricePPM$ } from './observables/enga-price'
  import { BigNumber } from 'ethers'
  import { config } from './configs'
  import { noNil, noSentinelOrUndefined } from './utils/no-sentinel-or-undefined'
  import { preSaleSignersVestings$ } from './observables/pre-sale/signers-vestings'
  import { preSaleTargetCollateralAllowance$ } from './observables/pre-sale/target-collateral-allowance'
  import { passNil } from './operators/pass-undefined'
  import { withUpdatesFrom } from './operators/with-updates-from'
  import {
    termsAndConditionsAgreements$,
    termsAndConditionsAgreementsController$,
  } from './observables/terms-and-condition-agreement'
  import { flashToast$, ToastType } from './contexts/flash-toast'
  import SwapInputRow from './SwapInputRow.svelte'
  import { type InputControl } from './Input.svelte'
  import { handleDerivedInputs } from './helpers/handle-drived-inputs'

  let canContribute = false
  $: canContribute = !!$signerAddress$?.length && $preSaleStatus$ === PreSaleStatus.Funding

  const baseControl$ = new ReplaySubject<InputControl>()
  const quoteControl$ = new ReplaySubject<InputControl>()
  const shouldApprove$ = new ReplaySubject<Partial<{ Should: boolean; Loading: boolean }>>()
  let waitingForTx = false
  const hasAgreed$ = termsAndConditionsAgreements$
  const successfulContribution$ = new ReplaySubject<{ Success: true }>()

  const { reset } = handleDerivedInputs(
    { base: baseControl$, quote: quoteControl$ },
    {
      base: {
        quote: switchMap(x =>
          engaPricePPM$.pipe(
            filter(noSentinelOrUndefined),
            filter(noNil),
            map(price => parseEther(x).mul(BigNumber.from(config.PPM).pow(2)).div(price)),
            map(x =>
              (Number(formatEther(x)) / config.PPM).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              }),
            ),
          ),
        ),
      },
      quote: {
        base: switchMap(x =>
          engaPricePPM$.pipe(
            filter(noSentinelOrUndefined),
            filter(noNil),
            map(price => parseEther(x).mul(price)),
            map(x =>
              (Number(formatEther(x)) / config.PPM).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              }),
            ),
          ),
        ),
      },
    },
  )

  successfulContribution$
    .pipe(
      controlStreamPayload('Success'),
      filter(x => x === true),
    )
    .subscribe(() => {
      reset()
      waitingForTx = true
      preSaleSignersVestings$.pipe(take(1)).subscribe(() => (waitingForTx = false))
    })

  preSaleTargetCollateralAllowance$
    .pipe(
      passNil(
        withUpdatesFrom(
          quoteControl$.pipe(controlStreamPayload('Value'), distinctUntilChanged(), startWith('0')),
        ),
        map(([allowance, x]) => allowance.lt(parseEther(x))),
      ),
      map(x => (_.isUndefined(x) ? { Loading: true } : { Loading: false, Should: x ?? false })),
      shareReplay(1),
    )
    .subscribe(shouldApprove$)

  const isLoadingAgreement$ = termsAndConditionsAgreementsController$.pipe(
    controlStreamPayload('Loading'),
  )

  const handleAgree = () => {
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

  const collateralTicker$ = PreSaleTargetERC20Collateral$.pipe(
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
        return combineLatest([PreSaleTargetERC20Collateral$, PreSaleContract$]).pipe(
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
        return ControllerContract$.pipe(
          tap(() => (waitingForTx = true)),
          requestContribute(value),
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
      }
      return of(false)
    }),
    map(x => () => firstValueFrom(x.pipe(map(() => undefined)))),
    startWith(_.noop),
  )
</script>

<Card
  className={{
    wrapper: 'relative grow',
    container: 'text-sm max-w-sm w-full sm:w-screen flex flex-col',
  }}>
  <span slot="header">{$__$?.presale.contribution.title}</span>
  <div
    class="flex flex-col space-y-7 md:h-full transition-all duration-1000 h-full {canContribute
      ? 'opacity-100'
      : 'opacity-0'}">
    <SwapInputRow
      icon={BusdIcon}
      control={quoteControl$}
      contract$={PreSaleTargetERC20Collateral$}
      isBase={false}>
      <span slot="title">{$__$?.presale.contribution.quote}</span>
    </SwapInputRow>
    <SwapInputRow icon={EngaIcon} control={baseControl$} contract$={EngaTokenContract$} isBase>
      <span slot="title">{$__$?.presale.contribution.base}</span>
    </SwapInputRow>
    <div class="flex justify-between flex-col space-y-4 md:flex-row md:space-y-0">
      <div class="flex space-x-1 items-start">
        <SvgIcon Icon={InfoIcon} width="1.125rem" height="1.125rem" />
        <span>{$__$?.presale.contribution.rate}</span>
      </div>
      <div>
        <span class="flex items-center">
          <span>1 ENGA:</span>
          <span class="flex text-yellow-400 text-right ml-2 relative min-w-[theme(spacing.5)]">
            <WithLoading data={$engaPrice$} predicate={_.negate(_.isUndefined)}>
              <span class="mr-1">
                {isSentinel($engaPrice$) ? $__$?.main.notAvailable : $engaPrice$}
              </span>
              <span>{$collateralTicker$}</span>
            </WithLoading>
          </span>
        </span>
      </div>
    </div>
    <div class="md:flex md:grow items-end w-full">
      <div
        class="flex flex-col space-y-7 md:flex-row md:space-y-0 md:justify-between md:items-center text-xs md:grow children:grow md:pb-2">
        <div class="flex space-x-2 items-center">
          <WithLoading
            data={_.isUndefined($hasAgreed$) || $isLoadingAgreement$}
            className={{
              container: 'items-center',
              wrapper: 'flex',
            }}
            predicate={e => !e}>
            <Fade
              visible={!!$hasAgreed$}
              mode="width"
              on:click={handleAgree}
              className={{ container: 'cursor-pointer' }}>
              <SvgIcon Icon={TickSquareIcon} width="1.25rem" height="1.25rem" />
            </Fade>
            <Fade
              visible={!$hasAgreed$}
              mode="width"
              on:click={handleAgree}
              className={{ container: 'cursor-pointer' }}>
              <SvgIcon Icon={TickSquareEmptyIcon} width="1.25rem" height="1.25rem" />
            </Fade>
          </WithLoading>
          <label on:click={handleAgree} class="text-text-secondary text-2xs cursor-pointer">
            {$__$?.presale.contribution.termsNotice}
          </label>
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
          className="flex justify-center m-0 !border-0 transition-colors {$shouldApprove$?.Should
            ? 'bg-blood'
            : 'bg-secondary-600'}">
          <Fade
            mode="width"
            visible={!$shouldApprove$?.Loading && !!$shouldApprove$?.Should && !!$hasAgreed$}
            className={{
              wrapper: 'flex space-x-2 items-center',
            }}>
            <SvgIcon Icon={TickIcon} width="1.125rem" height="1.125rem" />
            <span>
              {$__$?.presale.contribution.approve.toUpperCase()}
            </span>
          </Fade>
          <Fade
            mode="width"
            visible={!$shouldApprove$?.Loading && !$shouldApprove$?.Should && !!$hasAgreed$}
            className={{
              wrapper: 'flex space-x-2 items-center',
            }}>
            <SvgIcon Icon={FlashIcon} width="1.125rem" height="1.125rem" />
            <span>
              {$__$?.presale.contribution.swap.toUpperCase()}
            </span>
          </Fade>
          <Fade
            mode="width"
            visible={!$hasAgreed$}
            className={{
              wrapper: 'flex items-center',
            }}>
            <SvgIcon
              Icon={RestrictedIcon}
              width="1.5rem"
              height="1.5rem"
              className={'hidden md:flex'} />
            <span class="md:hidden">
              {$__$?.presale.errors.shouldAgree}
            </span>
          </Fade>
        </Button>
      </div>
    </div>
  </div>
  {#if !canContribute}
    <div transition:fade class="absolute inset-0 flex justify-center items-center h-full">
      {#if !$signerAddress$?.length && $preSaleStatus$ == PreSaleStatus.Funding}
        <span>
          {$__$?.web3Provider.connect.connectButton.notConnected}
        </span>
      {/if}
      {#if $preSaleStatus$ !== PreSaleStatus.Funding}
        <span>{$__$?.presale.contribution.unavailable}</span>{/if}
    </div>
  {/if}
</Card>
