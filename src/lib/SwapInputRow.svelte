<script lang="ts">
  import type { EngaToken, ERC20 } from 'engaland_fundraising_app/typechain'
  import { utils } from 'ethers'
  import _ from 'lodash'

  import {
    combineLatestWith,
    firstValueFrom,
    map,
    Observable,
    of,
    pipe,
    Subject,
    switchMap,
    take,
    type OperatorFunction,
  } from 'rxjs'
  import Button from './shared/Button.svelte'

  import Input from './Input.svelte'
  import type { InputComponentError, InputControl } from './input'
  import { __$ } from './shared/locales'
  import {
    CurrencyFormatterOperatorFactory,
    CurrencyParsersOperator,
    formatCurrencyWithUnit,
  } from './operators/currency-formatter'
  import { switchSome } from './operators/pass-undefined'
  import { userBalanceOf$$ } from './operators/web3/balance-of'
  import { sanitizeNumbers } from './utils/sanitize-numbers'
  import WithLoading from './shared/WithLoading.svelte'
  import { Option$ } from './types'

  export let control$: Subject<InputControl>
  export let icon: any
  export let contract$: Option$<ERC20 | EngaToken>
  export let isBase: boolean
  export let extraErrors$: Observable<InputComponentError> = of(undefined)
  export let disabled: boolean = false

  const ticker$ = contract$.pipe(
    switchSome(
      switchMap(x => x.name()),
      map(x => x.toUpperCase()),
    ),
  )

  const balance$ = userBalanceOf$$(contract$)

  const handleMax = () =>
    firstValueFrom(
      balance$.pipe(
        map(x => (x ? utils.formatEther(x) : '')),
        take(1),
      ),
    ).then(res => control$.next({ Value: res }))

  const validators: OperatorFunction<string, InputComponentError>[] = [
    pipe(
      combineLatestWith(extraErrors$),
      map(([, error]) => error),
    ),
  ]
</script>

<div class="text-text-secondary text-sm space-y-2">
  <div class="flex justify-between text-xs md:text-2xs items-center">
    <slot name="title" />
    <span class="flex">
      <WithLoading data={[$balance$ ?? undefined, $ticker$ ?? undefined]}>
        <span slot="before">
          {$__$?.presale.contribution.balance}:
        </span>
        <span slot="data">{formatCurrencyWithUnit($balance$)}</span>
      </WithLoading>
    </span>
  </div>
  <Input
    {disabled}
    options={{ inputmode: 'numeric' }}
    {icon}
    bind:control$
    sanitizer={map(sanitizeNumbers)}
    {validators}
    formatter={CurrencyFormatterOperatorFactory()}
    parser={CurrencyParsersOperator}
    className={{ outer: 'w-full', target: 'pr-14 font-mono' }}>
    {#if !isBase && $balance$}
      <Button slot="right" className={'!border-transparent text-blood px-2 w-12'} job={handleMax}>
        {$__$?.presale.contribution.max}
      </Button>
    {/if}
  </Input>
</div>
