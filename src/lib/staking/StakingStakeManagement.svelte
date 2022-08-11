<script lang="ts">
  import { useCreateControl } from '$lib/helpers/create-control'
  import { handleDerivedInputs } from '$lib/helpers/handle-drived-inputs'
  import { CurrencyFormatterOperatorFactory } from '$lib/operators/currency-formatter'
  import { config } from '$lib/configs'
  import { parseEther } from '$lib/utils/parse-ether'
  import { map, OperatorFunction, pipe, Subject } from 'rxjs'
  import { BigNumber, BigNumberish, utils } from 'ethers'
  import type { InputComponentError, InputControl } from '$lib/input'
  import SingleStakeManagerItem from './SingleStakeManagerItem.svelte'
  import { parsePPM } from '$lib/operators/web3/ppm'

  // -- props

  let className: { [key in 'container']?: string } = {}
  export { className as class }
  // export let contract$:

  // -- defs

  const formatter = CurrencyFormatterOperatorFactory(2, true)

  const percentToFormattedValue = (max: BigNumberish): OperatorFunction<string | number, string> =>
    pipe(
      map(x =>
        BigNumber.from(max)
          .mul(Math.floor((Number(x) / 100) * config.PPM))
          .div(config.PPM),
      ),
      map(utils.formatEther),
      formatter,
    )

  const valueToPercent = (max: BigNumberish): OperatorFunction<string, string> =>
    pipe(
      map(x => parseEther(x).mul(config.PPM).mul(100).div(BigNumber.from(max))),
      parsePPM,
      map(String),
    )

  const handleInputs = (
    max: BigNumberish,
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
          slider: percentToFormattedValue(max),
        },
        slider: {
          input: valueToPercent(max),
        },
      },
    )

  const inputControlFactory = () => useCreateControl<InputControl>({ omit: ['LastKeyStroke'] })
  const maxValidatorFactory = (
    max: BigNumberish,
  ): OperatorFunction<string, InputComponentError>[] => [
    pipe(map(x => (parseEther(x).gt(max) ? 'Maximum Amount Exceded' : undefined))),
  ]

  // -- instances

  let maxStake = parseEther('899')
  let maxUnstake = parseEther('345')

  const stakeInputController$ = inputControlFactory()
  const unstakeInputController$ = inputControlFactory()

  const stakePercentController$ = inputControlFactory()
  const unstakePercentController$ = inputControlFactory()

  const stakeValidators = maxValidatorFactory(maxStake)
  const unstakeValidators = maxValidatorFactory(maxUnstake)

  const { reset: stakeReset } = handleInputs(
    maxStake,
    stakeInputController$,
    stakePercentController$,
  )

  const { reset: unstakeReset } = handleInputs(
    maxUnstake,
    unstakeInputController$,
    unstakePercentController$,
  )
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 {className.container ?? ''}">
  <SingleStakeManagerItem title="Stake" />
  <SingleStakeManagerItem title="Unstake" />
</div>
