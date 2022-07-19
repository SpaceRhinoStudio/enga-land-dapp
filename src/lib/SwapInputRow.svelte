<script lang="ts">
  import type { EngaToken, ERC20 } from 'engaland_fundraising_app/typechain'
  import { utils } from 'ethers'
  import _ from 'lodash'

  import {
    filter,
    map,
    Observable,
    of,
    pipe,
    Subject,
    switchMap,
    type OperatorFunction,
  } from 'rxjs'
  import Button from './shared/Button.svelte'

  import Input from './Input.svelte'
  import type { InputComponentError, InputControl } from './input'
  import { __$ } from './shared/locales'
  import { preSaleMinimumRequiredTargetCollateral$ } from './observables/pre-sale/minimum-required'
  import {
    CurrencyFormatterOperatorFactory,
    CurrencyParsersOperator,
  } from './operators/currency-formatter'
  import { passNil } from './operators/pass-undefined'
  import { signerBalanceOf } from './operators/web3/balance-of'
  import { withUpdatesUntilChanged } from './operators/with-updates-from'
  import { noNil, noSentinelOrUndefined } from './shared/utils/no-sentinel-or-undefined'
  import { parseEther } from './utils/parse-ether'
  import { sanitizeNumbers } from './utils/sanitize-numbers'
  import WithLoading from './shared/WithLoading.svelte'

  export let control$: Subject<InputControl>
  export let icon: any
  export let contract$: Observable<ERC20 | EngaToken | undefined | null>
  export let isBase: boolean

  const ticker$ = contract$.pipe(
    passNil(
      switchMap(x => x.name()),
      map(x => x.toUpperCase()),
    ),
  )
  const balance$ = contract$.pipe(
    signerBalanceOf,
    passNil(map(x => Number(utils.formatEther(x)).toLocaleString())),
  )

  const validators: OperatorFunction<string, InputComponentError>[] = !isBase
    ? [
        pipe(
          map(x => (_.isEmpty(x) ? undefined : x)),
          passNil(
            withUpdatesUntilChanged(
              contract$.pipe(signerBalanceOf, filter(noSentinelOrUndefined), filter(noNil)),
            ),
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
            withUpdatesUntilChanged(
              preSaleMinimumRequiredTargetCollateral$.pipe(
                filter(noSentinelOrUndefined),
                filter(noNil),
              ),
            ),
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
    : []
</script>

<div class="text-text-secondary text-sm space-y-2">
  <div class="flex justify-between text-xs md:text-2xs items-center">
    <slot name="title" />
    <span class="flex">
      <WithLoading data={[$balance$, $ticker$]}>
        <span slot="before">
          {$__$?.presale.contribution.balance}:
        </span>
        <span slot="data">{$balance$}</span>
      </WithLoading>
    </span>
  </div>
  <Input
    {icon}
    bind:control$
    sanitizer={map(sanitizeNumbers)}
    {validators}
    formatter={CurrencyFormatterOperatorFactory()}
    parser={CurrencyParsersOperator}
    className={{ outer: 'w-full', target: 'pr-14 font-mono' }}>
    {#if !isBase}
      <Button
        slot="right"
        className={'!border-0 text-blood px-2 w-12'}
        job={() => {
          contract$
            .pipe(
              signerBalanceOf,
              map(x => (x ? utils.formatEther(x) : '')),
            )
            .subscribe(x => control$.next({ Value: x }))
        }}>
        {$__$?.presale.contribution.max}
      </Button>
    {/if}
  </Input>
</div>
