<script lang="ts" context="module">
  function formatter(x: BigNumber): string {
    return (Number(utils.formatEther(x)) / config.PPM).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })
  }
</script>

<script lang="ts">
  import _ from 'lodash'
  import { __$ } from './shared/locales'
  import SvgIcon from './shared/SVGIcon.svelte'
  import WithLoading from './shared/WithLoading.svelte'
  import EngaIcon from './shared/assets/icons/enga-icon.svg'
  import CollateralIcon from './shared/assets/icons/dai-icon.svg'
  import InfoIcon from './shared/assets/icons/vuesax-linear-info-circle.svg'
  import { EngaTokenContract$ } from '../contracts/fundraising-contracts'
  import { isSentinel } from './shared/contexts/empty-sentinel'
  import {
    combineLatestWith,
    distinctUntilChanged,
    filter,
    map,
    Observable,
    pipe,
    shareReplay,
    startWith,
    switchMap,
  } from 'rxjs'
  import { parseEther } from './utils/parse-ether'
  import { controlStreamPayload } from './shared/operators/control-stream-payload'
  import { Contract, utils } from 'ethers'
  import { BigNumber } from 'ethers'
  import { config } from './configs'
  import { noNil } from './shared/utils/no-sentinel-or-undefined'
  import { switchSome, switchSomeMembers } from './operators/pass-undefined'
  import SwapInputRow from './SwapInputRow.svelte'
  import { handleDerivedInputs } from './helpers/handle-drived-inputs'
  import { inputControlFactory } from './Input.svelte'
  import { parsePPM } from './operators/web3/ppm'
  import { ContributeActionErrors, Sale } from './services/sale'
  import { formatCurrencyWithUnit } from './operators/currency-formatter'

  export let sale$: Observable<Sale<Contract>>

  const baseControl$ = inputControlFactory()
  const quoteControl$ = inputControlFactory()

  export const baseValue$ = baseControl$.pipe(
    controlStreamPayload('Value'),
    distinctUntilChanged(),
    startWith('0'),
  )
  export const quoteValue$ = quoteControl$.pipe(
    controlStreamPayload('Value'),
    distinctUntilChanged(),
    startWith('0'),
  )

  export const canContributeAmount$ = sale$.pipe(
    switchMap(sale => sale.canUserContributeAmount$$(quoteValue$)),
  )

  const error$ = canContributeAmount$.pipe(
    combineLatestWith(__$),
    combineLatestWith(
      sale$.pipe(
        switchMap(sale => sale.minimumContribution$),
        filter(noNil),
      ),
    ),
    map(([[can, __], min]) => {
      switch (can) {
        case true:
          return undefined
        case ContributeActionErrors.NO_KYC:
          return __.presale.errors.kyc
        case ContributeActionErrors.NOT_FUNDING:
          return __.presale.contribution.unavailable
        case ContributeActionErrors.LOW_BALANCE:
          return __.presale.errors.notEnoughBalance
        case ContributeActionErrors.LOW_ALLOWANCE:
          return undefined
        case ContributeActionErrors.LESS_THAN_MIN:
          return __.presale.errors.lowerThanMinimum(formatCurrencyWithUnit(min))
        default:
          return undefined
      }
    }),
    distinctUntilChanged(),
    shareReplay(1),
  )

  const ratePPM$ = sale$.pipe(switchMap(sale => sale.exchangeRatePPM$))

  export let hasErrors: boolean = false
  $: hasErrors = !!$quoteControl$?.Errors?.length || !!$baseControl$?.Errors?.length

  export const reset = handleDerivedInputs(
    { base: baseControl$, quote: quoteControl$ },
    {
      base: {
        quote: pipe(
          combineLatestWith(ratePPM$),
          switchSomeMembers(
            map(([x, price]) => parseEther(x).mul(BigNumber.from(config.PPM).pow(2)).div(price)),
            map(formatter),
          ),
          filter(noNil),
        ),
      },
      quote: {
        base: pipe(
          combineLatestWith(ratePPM$),
          switchSomeMembers(
            map(([x, price]) => parseEther(x).mul(price)),
            map(formatter),
          ),
          filter(noNil),
        ),
      },
    },
  ).reset

  const collateralTicker$ = sale$.pipe(
    switchMap(sale => sale.targetCollateral$),
    switchSome(
      switchMap(x => x.name()),
      map(x => x.toUpperCase()),
    ),
  )

  const exchangeRate$ = ratePPM$.pipe(parsePPM)
</script>

<SwapInputRow
  icon={CollateralIcon}
  control$={quoteControl$}
  contract$={sale$.pipe(switchMap(sale => sale.targetCollateral$))}
  extraErrors$={error$}
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
