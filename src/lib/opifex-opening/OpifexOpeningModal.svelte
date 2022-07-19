<script lang="ts" context="module">
  import {
    filter,
    map,
    Observable,
    of,
    pipe,
    ReplaySubject,
    Subject,
    switchMap,
    type OperatorFunction,
  } from 'rxjs'

  enum States {
    idle,
    confirm,
    collateralInput,
    minting,
    minted,
    failed,
  }

  const validatorsFactory: (
    min$: Observable<BigNumber>,
  ) => OperatorFunction<string, InputComponentError>[] = min$ => [
    pipe(
      map(x => (_.isEmpty(x) ? undefined : x)),
      passNil(
        withUpdatesUntilChanged(engaBalanceRaw$.pipe(filter(noSentinel), filter(noNil))),
        map(([x, balance]) => parseEther(x).lte(balance)),
        switchMap(x =>
          x ? of(undefined) : __$.pipe(map(__ => __.presale.errors.notEnoughBalance)),
        ),
      ),
      map(x => (_.isNull(x) ? undefined : x)),
    ),
    pipe(
      map(x => (_.isEmpty(x) ? undefined : x)),
      passNil(
        withUpdatesFrom(min$),
        switchMap(([x, min]) =>
          parseEther(x).gte(min)
            ? of(undefined)
            : __$.pipe(
                map(__ =>
                  __.presale.errors.lowerThanMinimum(
                    Number(utils.formatEther(min)).toLocaleString(),
                  ),
                ),
              ),
        ),
      ),
      map(x => (_.isNull(x) ? undefined : x)),
    ),
  ]
</script>

<script lang="ts">
  import Button from '$lib/shared/Button.svelte'
  import Modal from '$lib/shared/Modal.svelte'
  import _, { gt } from 'lodash'
  import Card from '$lib/Card.svelte'
  import cn from 'classnames'
  import { screen$ } from '$lib/shared/helpers/media-queries'
  import WithCurrencyIcon from '$lib/WithCurrencyIcon.svelte'
  import { engaBalance$, engaBalanceRaw$ } from '$lib/observables/enga/enga-balance'
  import { __$ } from '$lib/shared/locales'
  import { flashToast$ } from '$lib/shared/contexts/flash-toast'
  import OpifexOpeningPagination from '$lib/opifex-opening/OpifexOpeningPagination.svelte'
  import OpifexOpeningEndrosCarousel from '$lib/opifex-opening/OpifexOpeningEndrosCarousel.svelte'
  import { EndroMeta } from '$lib/types/enga'
  import { tick } from 'svelte'
  import FlipCard from '$lib/FlipCard.svelte'
  import { waitFor } from '$lib/shared/helpers/wait-for'
  import OpifexOpeningEndroItem from '$lib/opifex-opening/OpifexOpeningEndroItem.svelte'
  import Input from '$lib/Input.svelte'
  import EngaIcon from '$lib/shared/assets/icons/enga-icon.svg'
  import type { InputComponentError, InputControl } from '$lib/input'
  import { noNil, noSentinel } from '$lib/shared/utils/no-sentinel-or-undefined'
  import { passNil } from '$lib/operators/pass-undefined'
  import { withUpdatesFrom, withUpdatesUntilChanged } from '$lib/operators/with-updates-from'
  import { parseEther } from '$lib/utils/parse-ether'
  import { BigNumber, utils } from 'ethers'
  import { sanitizeNumbers } from '$lib/utils/sanitize-numbers'
  import {
    CurrencyFormatterOperatorFactory,
    CurrencyParsersOperator,
  } from '$lib/operators/currency-formatter'
  import { useCreateControl } from '$lib/helpers/create-control'
  import { slide } from 'svelte/transition'
  import BackIcon from '$lib/shared/assets/icons/vuesax-linear-arrow-left-2.svg'
  import SvgIcon from '$lib/shared/SVGIcon.svelte'
  import Confetti from '$lib/shared/Confetti.svelte'

  export let endros: EndroMeta[] | undefined

  let curr = 0
  function next() {
    if (state === States.idle) {
      tick().then(() => {
        curr = (curr + 1) % (endros?.length ?? 0)
      })
    }
  }
  function prev() {
    if (state === States.idle) {
      tick().then(() => {
        curr = (curr - 1 + (endros?.length ?? 0)) % (endros?.length ?? 0)
      })
    }
  }

  export let toggle: () => void
  let toggleCollateralInput: () => void

  let state: States = States.idle

  // FIX //REVIEW: shouldn't powerSource be a BigNumber???!
  const currentMin$ = new ReplaySubject<BigNumber>(1)
  $: currentMin$.next(parseEther(endros?.[curr]?.powerSource) ?? BigNumber.from(0))
  const validators = validatorsFactory(currentMin$)

  const collateralInputControl$ = useCreateControl<InputControl>()
  $: collateralInputControl$.next({
    Value: utils.formatEther(parseEther(endros?.[curr]?.powerSource)),
  })

  $: extra = parseEther($collateralInputControl$.Value).sub(parseEther(endros?.[curr]?.powerSource))
</script>

<Modal bind:toggle acceptExit>
  <Card
    className={{
      container: cn(
        'max-w-xl w-screen box-border mx-3 !pt-6',
        $screen$.isMobile && '!rounded-b-none',
      ),
      wrapper: 'flex flex-col gap-2 md:gap-4 items-center',
    }}>
    {#if endros?.length}
      <div class="flex gap-4 w-full">
        <div class="flex flex-col gap-4 items-center w-full">
          <OpifexOpeningEndrosCarousel
            {next}
            {prev}
            {curr}
            {endros}
            selected={state > States.idle} />
          {#if !$screen$.isMobile}
            <div
              class={cn(
                'flex gap-2 justify-center items-center text-text-secondary text-xs',
                'transition-all duration-500 will-change-transform',
                state > States.idle && 'scale-[1.15]',
              )}>
              <span>{$__$.dashboard.opifex.yourBalance}</span>
              <!-- DEBUG dummy value -->
              <WithCurrencyIcon iconDimensions="1.2rem" data={$engaBalance$ ?? 23403.3} />
            </div>
          {/if}
          <FlipCard
            setWidthFrom="front"
            setHeightFrom="front"
            backfaceVisible={state > States.idle}
            className={{
              wrapper: '!duration-500',
              container: '!duration-500',
              backfaceWrapper: '!duration-500',
            }}>
            <Button
              job={() => {
                state = States.confirm
              }}
              className="max-w-full w-60"
              active>
              {$__$.dashboard.opifex.mint}
            </Button>
            <div slot="backface" class="flex gap-2 text-sm">
              <Button
                disabled={state > States.confirm}
                job={async () => {
                  // TODO: mint endro
                  state = States.collateralInput
                  toggleCollateralInput()
                }}
                className="max-w-full w-60"
                active>
                <!-- TODO: tl -->
                CONTINUE
              </Button>
              <Button
                disabled={state > States.confirm}
                job={() => {
                  state = States.idle
                }}
                className="max-w-full w-60"
                danger>
                <!-- TODO: tl -->
                CANCEL
              </Button>
            </div>
          </FlipCard>
        </div>
      </div>
      <OpifexOpeningPagination
        {next}
        {prev}
        {curr}
        length={endros.length}
        className={{
          container: cn(
            'transition-all duration-500',
            state > States.idle && 'blur-md pointer-events-none',
          ),
        }} />
    {/if}
  </Card>
</Modal>

<!-- DEBUG: isOpen -->
<Modal
  bind:toggle={toggleCollateralInput}
  acceptExit={state < States.minted}
  on:requestExit={() => {
    if (state < States.minting) {
      state = States.idle
    }
  }}>
  <Card
    className={{
      container: cn(
        'max-w-xs w-screen relative md:mt-28 !overflow-visible',
        $screen$.isMobile && '!rounded-b-none',
      ),
      wrapper: 'pt-36 md:pt-48 !mt-2 !px-3',
    }}>
    <div class="absolute top-3pt-36 md:top-48 -translate-y-full left-1/2 -translate-x-1/2">
      <OpifexOpeningEndroItem meta={endros?.[curr]} selected collateralMode />
    </div>
    <div class="relative flex flex-col gap-3">
      <div
        class="contents children:transition-all children:duration-500 {state > States.minting &&
          'children:translate-y-32 children:opacity-0'}">
        <div
          class={cn(
            'flex gap-2 justify-center items-center text-text-secondary text-sm md:text-base',
            'transition-all duration-500 will-change-transform',
          )}>
          <span>{$__$.dashboard.opifex.yourBalance}</span>
          <!-- DEBUG dummy value -->
          <WithCurrencyIcon
            iconDimensions={$screen$.isMobile ? '1rem' : '1.3rem'}
            data={$engaBalance$ ?? 23403.3} />
        </div>
        <div class="text-text-secondary text-sm space-y-1">
          <p>
            <!-- TODO: tl -->
            Lock enough collateral to mint your Endro
          </p>
          <p>
            <!-- TODO: tl -->
            You can also lock more collateral to increase your Endro's value.
          </p>
        </div>
        <Input
          disabled={state > States.collateralInput}
          control$={collateralInputControl$}
          {validators}
          icon={EngaIcon}
          sanitizer={map(sanitizeNumbers)}
          formatter={CurrencyFormatterOperatorFactory(2)}
          parser={CurrencyParsersOperator} />
        <div class="-mt-3">
          {#if extra.gt(0)}
            <div transition:slide class="text-sm flex gap-2 pt-1 items-center">
              <span class="">
                <!-- TODO: tl -->
                You will pay extra
              </span>
              <WithCurrencyIcon
                iconDimensions={$screen$.isMobile ? '1rem' : '1.3rem'}
                data={extra} />
            </div>
          {/if}
        </div>
        <div class="flex gap-3 mt-2">
          <Button
            className={cn('text-sm !py-3 !px-3')}
            job={() => {
              state = States.idle
              toggleCollateralInput()
            }}>
            <!-- TODO: tl -->
            <SvgIcon Icon={BackIcon} dimensions="1.2rem" />
          </Button>
          <Button
            job={async () => {
              //TODO: implement
              state = States.minting
              try {
                await waitFor(2000)
                state = States.minted
              } catch {
                state = States.failed
              }
            }}
            className={cn('text-sm !py-3 grow')}
            active>
            <!-- TODO: tl -->
            CONFIRM MINT
          </Button>
        </div>
      </div>
      <div
        class={cn(
          'absolute inset-0 flex flex-col gap-4 justify-center items-center',
          'transition-all duration-500',
          state !== States.minted && '-translate-y-32 opacity-0 pointer-events-none',
        )}>
        <span class="font-serif text-secondary-500 text-3xl">
          <!-- TODO: tl -->
          Success!
        </span>
        <!-- TODO: redirect to endro management page -->
        <Button active>
          <!-- TODO: tl -->
          Take me to my Endro
        </Button>
        {#if state === States.minted}
          <Confetti
            offsetHeight={$screen$.isMobile ? 250 : 150}
            offsetWidth={0}
            confettiCount={300}
            sequinCount={100} />
        {/if}
      </div>
      <div
        class={cn(
          'absolute inset-0 flex flex-col gap-4 justify-center items-center',
          'transition-all duration-500',
          state !== States.failed && '-translate-y-32 opacity-0 pointer-events-none',
        )}>
        <span class="font-serif text-blood text-3xl">
          <!-- TODO: tl -->
          Failure
        </span>
        <Button
          job={() => {
            state = States.collateralInput
          }}>
          <!-- TODO: tl -->
          Retry
        </Button>
      </div>
    </div>
  </Card>
</Modal>
