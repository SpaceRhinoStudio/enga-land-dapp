<script lang="ts" context="module">
  const formatter = CurrencyFormatterOperatorFactory(2, true)

  const percentToFormattedValue = (
    max$: Observable<BigNumberish>,
  ): OperatorFunction<string | number, string> =>
    pipe(
      withLatestFrom(max$),
      map(([x, max]) =>
        BigNumber.from(max)
          .mul(Math.floor((Number(x) / 100) * config.PPM))
          .div(config.PPM),
      ),
      map(utils.formatEther),
      formatter,
    )

  const valueToPercent = (max$: Observable<BigNumberish>): OperatorFunction<string, string> =>
    pipe(
      withLatestFrom(max$),
      map(([x, max]) => parseEther(x).mul(config.PPM).mul(100).div(BigNumber.from(max))),
      parsePPM,
      map(String),
    )

  const handleInputs = (
    max$: Observable<BigNumberish>,
    input$: Subject<InputControl>,
    slider$: Subject<InputControl>,
  ): { reset: () => void } =>
    handleDerivedInputs(
      {
        input: input$,
        slider: slider$,
      },
      {
        input: {
          slider: percentToFormattedValue(max$),
        },
        slider: {
          input: valueToPercent(max$),
        },
      },
    )

  const maxValidatorFactory = (
    max$: Observable<BigNumberish>,
  ): OperatorFunction<string, InputComponentError>[] => [
    pipe(
      combineLatestWith(max$),
      map(([x, max]) => (parseEther(x).gt(max) ? 'Maximum Amount Exceded' : undefined)),
    ),
  ]
</script>

<script lang="ts">
  import { handleDerivedInputs } from '$lib/helpers/handle-drived-inputs'
  import {
    CurrencyFormatterOperatorFactory,
    CurrencyParsersOperator,
  } from '$lib/operators/currency-formatter'
  import Button from '$lib/shared/Button.svelte'
  import { config } from '$lib/configs'
  import Slider from '$lib/Slider.svelte'
  import { parseEther } from '$lib/utils/parse-ether'
  import { sanitizeNumbers } from '$lib/utils/sanitize-numbers'
  import {
    combineLatestWith,
    delay,
    map,
    mergeMap,
    Observable,
    of,
    OperatorFunction,
    pipe,
    Subject,
    withLatestFrom,
  } from 'rxjs'
  import { BigNumber, BigNumberish, utils } from 'ethers'
  import Input, { inputControlFactory } from '$lib/Input.svelte'
  import type { InputComponentError, InputControl } from '$lib/input'
  import { flashToast$ } from '$lib/shared/contexts/flash-toast'
  import { ERC20 } from 'engaland_fundraising_app/typechain'
  import { createEventDispatcher, onMount, tick } from 'svelte'
  import { rnd } from '$lib/shared/utils/random'
  import WithLoading from '$lib/shared/WithLoading.svelte'
  import { fade } from 'svelte/transition'
  import LoadingOverlay from '$lib/shared/LoadingOverlay.svelte'
  import { parsePPM } from '$lib/operators/web3/ppm'

  // -- props

  export let title: string
  //TODO: use
  export let lpContact$: Observable<ERC20>

  // -- instances
  //TODO: fetcch from lpContract$
  $: max$ = of(parseEther(rnd(0, 100, true))).pipe(delay(2000))

  //TODO: use
  const dispatch = createEventDispatcher<{
    approve?: 'start' | 'cancel' | 'success'
    action?: 'initiated'
  }>()

  const inputController$ = inputControlFactory()
  const percentController$ = inputControlFactory()

  $: validators = maxValidatorFactory(max$)

  //TODO: use
  $: reset = handleInputs(max$, inputController$, percentController$).reset

  inputController$.next({ Value: '' })
</script>

<div class="flex flex-col gap-2">
  <span>{title}</span>
  <div class="border border-primary-600 flex flex-col rounded-xl p-6 gap-6 relative">
    <div
      class="contents children:transition-opacity {$max$ === undefined
        ? 'children:opacity-0'
        : 'children:opacity-100'}">
      <div transition:fade class="flex flex-col md:flex-row gap-16 md:gap-5 items-center">
        <Input
          sanitizer={map(sanitizeNumbers)}
          {validators}
          {formatter}
          parser={CurrencyParsersOperator}
          className={{
            target: 'bg-transparent !rounded-xl text-center border-2 focus:border-secondary-500',
            outer: 'grow-0 md:w-1/4',
          }}
          control$={inputController$} />
        <Slider
          disabled={$max$?.eq(0)}
          class={{ container: 'grow' }}
          control$={percentController$} />
      </div>
      <div transition:fade class="flex justify-between items-center gap-6">
        <WithLoading
          data={$max$}
          className={{ container: 'flex items-center gap-2 text-text-hover' }}>
          <span slot="before">Balance</span>
          <span slot="data">
            {Number(utils.formatEther($max$)).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </WithLoading>
        <!-- TODO: implement -->
        <Button
          job={() => flashToast$.next('this is just a demo!')}
          secondary
          className="font-bold">
          APPROVE ENGA
        </Button>
      </div>
    </div>

    <LoadingOverlay visible={$max$ === undefined} />
  </div>
</div>
