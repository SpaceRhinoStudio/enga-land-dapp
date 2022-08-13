import {
  fundraisingContractABIs,
  fundraisingContractAddresses,
  type FundraisingContractNames,
} from '$lib/configs/fundraising-contracts'
import { Contract } from 'ethers'
import {
  combineLatestWith,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  merge,
  of,
  scan,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs'
import type {
  PreSale,
  SeedSale,
  ERC20,
  MarketMaker,
  TokenManager,
  EngaToken,
  Controller,
  KycAuthorization,
} from 'engaland_fundraising_app/typechain'
import { combineLatestSwitchMap } from '$lib/operators/combine-latest-switch'
import { switchSome, switchSomeMembers } from '$lib/operators/pass-undefined'
import { externalContractAbi$Factory } from '$lib/providers/external-contract-abi'
import { selectedNetwork$ } from '$lib/observables/web3-network'
import { flashToast$, ToastLevel } from '$lib/shared/contexts/flash-toast'
import { noNil } from '$lib/shared/utils/no-sentinel-or-undefined'
import { config } from '$lib/configs'
import type { Option$, WithDeployBlock } from '$lib/types'
import { isEqual } from '$lib/shared/utils/type-safe'
import { fallbackWeb3Provider$ } from '$lib/observables/web3-providers/fallback-provider'

function fundraisingContract$Factory<T extends Contract>(
  key: FundraisingContractNames,
  explicitAddress?: string,
): Option$<WithDeployBlock<T>> {
  return fallbackWeb3Provider$.pipe(
    combineLatestWith(selectedNetwork$),
    switchSomeMembers(
      distinctUntilChanged(isEqual),
      map(([x, network]) =>
        fundraisingContractAddresses[network]?.[key] ?? explicitAddress
          ? ([x, network] as const)
          : null,
      ),
      switchSome(
        combineLatestSwitchMap(([, network]) =>
          merge(
            // verifiedContractAbi$Factory(
            //     fundraisingContractAddresses[network]![key]!,
            // ),
            of(fundraisingContractABIs[network]?.[key]),
            externalContractAbi$Factory(key),
          ).pipe(
            scan((acc, x) => acc ?? x, undefined as string | undefined),
            distinctUntilChanged(),
          ),
        ),
        map(([[x, network], abi]) => {
          if (!(abi && (fundraisingContractAddresses[network]![key]?.address ?? explicitAddress))) {
            return null
          }
          const res = new Contract(
            (fundraisingContractAddresses[network]![key]?.address ?? explicitAddress)!,
            abi,
            x,
          ) as T
          ;(res as WithDeployBlock<T>).deployedOn =
            fundraisingContractAddresses[network]![key]?.blockNumber ?? 0
          return res as WithDeployBlock<T>
        }),
      ),
    ),
    startWith(undefined),
    distinctUntilChanged(),
    shareReplay(1),
  )
}

export const PreSaleContract$ = fundraisingContract$Factory<PreSale>('PreSale')
export const SeedSaleContract$ = fundraisingContract$Factory<SeedSale>('SeedSale')

export const PreSaleTargetERC20Collateral$ = PreSaleContract$.pipe(
  switchSome(
    switchMap(x => x.contributionToken()),
    switchMap(x => fundraisingContract$Factory<ERC20>('ERC20', x)),
  ),
  shareReplay(1),
)

export const SeedSaleTargetERC20Collateral$ = SeedSaleContract$.pipe(
  switchSome(
    switchMap(x => x.contributionToken()),
    switchMap(x => fundraisingContract$Factory<ERC20>('ERC20', x)),
  ),
  shareReplay(1),
)

export const MarketMakerContract$ = fundraisingContract$Factory<MarketMaker>('MarketMaker')

export const TokenManagerContract$ = fundraisingContract$Factory<TokenManager>('TokenManager')

export const EngaTokenContract$ = fundraisingContract$Factory<EngaToken>('EngaToken')

export const ControllerContract$ = fundraisingContract$Factory<Controller>('Controller')

export const KycContract$ = fundraisingContract$Factory<KycAuthorization>('KycAuthorization')

ControllerContract$.pipe(
  combineLatestWith(selectedNetwork$.pipe(filter(noNil), distinctUntilChanged())),
  distinctUntilChanged(isEqual),
  debounceTime(1000),
  filter(([c]) => c === null),
  map(([, n]) => n),
).subscribe(network =>
  flashToast$.next({
    message: `It seems like our protocol is not yet deployed on "${config.Chains[network].config.chainName}".\nPlease try another network.`,
    level: ToastLevel.WARNING,
    timeout: 15000,
  }),
)
