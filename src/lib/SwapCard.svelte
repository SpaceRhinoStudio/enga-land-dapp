<script lang="ts">
  import _ from 'lodash'
  import { fade, fly, slide } from 'svelte/transition'
  import Button from './shared/Button.svelte'
  import Card from './Card.svelte'
  import { __$ } from './shared/locales'
  import SvgIcon from './shared/SVGIcon.svelte'
  import TickIcon from './shared/assets/icons/vuesax-linear-tick-circle.svg'
  import FlashIcon from './shared/assets/icons/vuesax-linear-flash.svg'
  import RestrictedIcon from './shared/assets/icons/vuesax-linear-group.svg'
  import { signerAddress$ } from './observables/selected-web3-provider'
  import {
    debounceTime,
    distinctUntilChanged,
    exhaustMap,
    filter,
    finalize,
    first,
    firstValueFrom,
    map,
    Observable,
    of,
    shareReplay,
    skip,
    switchMap,
    tap,
    throwError,
    withLatestFrom,
  } from 'rxjs'
  import { controlStreamPayload } from './shared/operators/control-stream-payload'
  import { switchSome } from './operators/pass-undefined'
  import { flashToast$, ToastLevel } from './shared/contexts/flash-toast'
  import SwapCardAgreement from './SwapCardAgreement.svelte'
  import SwapCardInputs from './SwapCardInputs.svelte'
  import { ContributeActionErrors, Sale, SaleStatus } from './services/sale'
  import { Contract } from 'ethers'
  import { ActionStatus, Option } from './types'
  import { isWeb3Error, Web3Errors, nameOfWeb3Error } from './helpers/web3-errors'
  import { isEqual } from './shared/utils/type-safe'
  import LoadingSpinner from './shared/LoadingSpinner.svelte'

  export let sale$: Observable<Sale<Contract>>

  $: canContribute$ = sale$.pipe(
    switchMap(sale => sale.canUserContribute$),
    debounceTime(500),
  )

  $: isNotFunding$ = sale$.pipe(
    switchMap(x => x.status$),
    map(x => x !== SaleStatus.Funding),
  )

  let canContributeAmount$: Observable<true | Web3Errors.INVALID_PARAMS | ContributeActionErrors>

  let quoteValue$: Observable<string>

  $: approve$ = quoteValue$
    ? sale$.pipe(
        map(sale => sale.approve(quoteValue$)),
        map(x => x.call),
      )
    : undefined

  let hasAgreed: Option<boolean>

  let waitingForTx = false

  let reset: () => void

  $: isLoadingContrib = _.isUndefined($canContributeAmount$)
  $: shouldApprove = $canContributeAmount$ === ContributeActionErrors.LOW_ALLOWANCE
  $: canContrib = $canContributeAmount$ === true

  $: swap = () => {
    if (shouldApprove) {
      const isApprovalDone$ = canContributeAmount$.pipe(
        filter(x => x !== ContributeActionErrors.LOW_ALLOWANCE),
        map(() => true),
        shareReplay(1),
      )
      const sub = isApprovalDone$.subscribe()
      return firstValueFrom(
        approve$?.pipe(
          tap(() => (waitingForTx = true)),
          first(),
          exhaustMap(x => x()),
          filter(x => x !== ActionStatus.PENDING),
          withLatestFrom(__$),
          tap(([status, __]) => {
            switch (status) {
              // should be handled beforehand
              case Web3Errors.INVALID_PARAMS:
                return flashToast$.next({
                  level: ToastLevel.ERROR,
                  message: __.main.requirementsNotMet,
                })
              case ActionStatus.SUCCESS:
              case ActionStatus.USELESS:
              case Web3Errors.REJECTED:
                return
              default:
                return flashToast$.next({
                  level: ToastLevel.ERROR,
                  message: __.main.genericErrorMessage,
                })
            }
          }),
          switchMap(([status]) =>
            status !== ActionStatus.SUCCESS ? throwError(() => false) : of(true),
          ),
          switchSome(switchMap(() => isApprovalDone$)),
          finalize(() => (waitingForTx = false)),
          finalize(() => sub.unsubscribe()),
        ) ?? of(null),
      )
    }
    if (canContrib) {
      const hasNewVesting$ = sale$.pipe(
        switchMap(sale => sale.userVestings$),
        skip(1),
        distinctUntilChanged(isEqual),
        map(() => true),
        shareReplay(1),
      )
      const sub = hasNewVesting$.subscribe()
      return firstValueFrom(
        sale$.pipe(
          tap(() => (waitingForTx = true)),
          exhaustMap(sale => sale.contribute(quoteValue$)),
          withLatestFrom(__$),
          tap(([status, __]) => {
            switch (status) {
              // all should be handled beforehand
              case Web3Errors.INVALID_PARAMS:
              case ContributeActionErrors.LESS_THAN_MIN:
              case ContributeActionErrors.NOT_FUNDING:
              case ContributeActionErrors.NO_KYC:
              case ContributeActionErrors.LOW_ALLOWANCE:
              case ContributeActionErrors.LOW_BALANCE:
                return flashToast$.next({
                  level: ToastLevel.ERROR,
                  message:
                    __.main.requirementsNotMet +
                    '\n' +
                    (isWeb3Error(status) ? nameOfWeb3Error(status) : status),
                })
              case ActionStatus.FAILURE:
                return flashToast$.next({
                  level: ToastLevel.ERROR,
                  message: __.main.genericErrorMessage,
                })
              case ActionStatus.SUCCESS:
                return flashToast$.next({
                  level: ToastLevel.SUCCESS,
                  message: __.userInteraction.toastTitles[ToastLevel.SUCCESS],
                })
              default:
                return
            }
          }),
          switchMap(([status]) =>
            status !== ActionStatus.SUCCESS ? throwError(() => false) : of(true),
          ),
          switchMap(() => hasNewVesting$),
          tap(reset),
          finalize(() => (waitingForTx = false)),
          finalize(() => sub.unsubscribe()),
        ),
      )
    }
    return
  }
</script>

<Card
  className={{
    container: 'text-sm sm:w-screen flex flex-col !overflow-visible',
    wrapper: 'relative grow min-h-[theme(spacing.20)]',
  }}>
  <span slot="header">{$__$?.presale.contribution.title}</span>
  {#if $canContribute$ === true}
    <div
      transition:slide
      class="flex flex-col space-y-7 md:h-full transition-all duration-1000 h-full {$canContribute$ ===
      true
        ? 'opacity-100'
        : 'opacity-0'}">
      <SwapCardInputs
        waitingForTx={_.isUndefined(hasAgreed) || isLoadingContrib || waitingForTx}
        {sale$}
        bind:reset
        bind:canContributeAmount$
        bind:quoteValue$ />
      <div class="md:flex md:grow items-end w-full">
        <div
          class="flex flex-col gap-7 md:flex-row md:justify-between md:items-center md:grow children:grow md:pb-2">
          <SwapCardAgreement bind:hasAgreed />
          <Button
            tooltip={hasAgreed ? undefined : $__$.presale.errors.shouldAgree}
            job={swap}
            disabled={!hasAgreed || (!canContrib && !shouldApprove)}
            isLoading={_.isUndefined(hasAgreed) || isLoadingContrib || waitingForTx}
            className="h-12 md:h-9 flex w-full md:w-36 relative items-center justify-center m-0 !border-transparent {shouldApprove
              ? 'bg-yellow-700'
              : 'bg-secondary-700'}">
            {#if !isLoadingContrib && hasAgreed}
              {#if shouldApprove}
                <div
                  in:fly={{ x: -50 }}
                  out:fly={{ x: 50 }}
                  class="absolute inset-0 flex justify-center gap-2 items-center">
                  <SvgIcon Icon={TickIcon} width="1.125rem" height="1.125rem" />
                  <span>
                    {$__$?.presale.contribution.approve.toUpperCase()}
                  </span>
                </div>
              {:else}
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
            {:else}
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
  {:else}
    <div transition:fade class="absolute inset-0">
      {#if !$signerAddress$?.length && $canContribute$ !== ContributeActionErrors.NOT_FUNDING && !$isNotFunding$}
        <span
          class="absolute inset-0 flex justify-center items-center text-center"
          transition:fade|local>
          {$__$?.web3Provider.connect.connectButton.notConnected}
        </span>
      {:else if $canContribute$ === ContributeActionErrors.NOT_FUNDING || $isNotFunding$}
        <span
          class="absolute inset-0 flex justify-center items-center text-center"
          transition:fade|local>{$__$?.presale.contribution.unavailable}</span>
      {:else if $canContribute$ === ContributeActionErrors.NO_KYC}
        <span
          class="absolute inset-0 flex justify-center items-center text-center"
          transition:fade|local>{$__$?.presale.errors.kyc}</span>
      {:else if $canContribute$ === Web3Errors.RESOURCE_NOT_FOUND || $canContribute$ === undefined}
        <span
          class="absolute inset-0 flex justify-center items-center text-center"
          transition:fade|local>
          <LoadingSpinner />
        </span>
      {:else}
        <span
          class="absolute inset-0 flex justify-center items-center text-center"
          transition:fade|local>{$__$?.main.genericErrorMessage}</span>
      {/if}
    </div>
  {/if}
</Card>
