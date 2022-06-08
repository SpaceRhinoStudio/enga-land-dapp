import {
  fundraisingContractABIs,
  fundraisingContractAddresses,
  type FundraisingContractNames,
} from '$lib/configs/fundraising-contracts'
import { Contract } from 'ethers'
import { signerOrProvider$ } from '$lib/observables/signer-or-provider'
import {
  distinctUntilChanged,
  map,
  merge,
  Observable,
  of,
  scan,
  shareReplay,
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
} from 'engaland_fundraising_app/typechain'
import { withUpdatesFrom, withUpdatesUntilChanged } from '$lib/operators/with-updates-from'
import { passNil, passUndefined } from '$lib/operators/pass-undefined'
import { externalContractAbi$Factory } from '$lib/providers/external-contract-abi'
import { selectedNetwork$ } from '$lib/observables/web3-network'
import _ from 'lodash'

function fundraisingContract$Factory<T extends Contract>(
  key: FundraisingContractNames,
  explicitAddress?: string,
): Observable<(T & { deployedOn: number }) | undefined | null> {
  return signerOrProvider$.pipe(
    passNil(
      withUpdatesFrom(selectedNetwork$),
      map(([x, network]) =>
        fundraisingContractAddresses[network]?.[key] ?? explicitAddress
          ? ([x, network] as const)
          : null,
      ),
    ),
    passNil(
      withUpdatesUntilChanged(([, network]) =>
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
          return undefined
        }
        const res = new Contract(
          (fundraisingContractAddresses[network]![key]?.address ?? explicitAddress)!,
          abi,
          x,
        ) as T
        ;(res as T & { deployedOn: number }).deployedOn =
          fundraisingContractAddresses[network]![key]?.blockNumber ?? 0
        return res as T & { deployedOn: number }
      }),
    ),
    distinctUntilChanged(),
    shareReplay(1),
  )
}

export const PreSaleContract$ = fundraisingContract$Factory<PreSale>('PreSale')
export const SeedSaleContract$ = fundraisingContract$Factory<SeedSale>('SeedSale')

export const PreSaleTargetERC20Collateral$ = PreSaleContract$.pipe(
  passNil(
    switchMap(x => x.contributionToken()),
    switchMap(x => fundraisingContract$Factory<ERC20>('ERC20', x)),
  ),
  shareReplay(1),
)

export const SeedSaleTargetERC20Collateral$ = SeedSaleContract$.pipe(
  passNil(
    switchMap(x => x.contributionToken()),
    switchMap(x => fundraisingContract$Factory<ERC20>('ERC20', x)),
  ),
  shareReplay(1),
)

export const MarketMakerContract$ = fundraisingContract$Factory<MarketMaker>('MarketMaker')

export const TokenManagerContract$ = fundraisingContract$Factory<TokenManager>('TokenManager')

export const EngaTokenContract$ = fundraisingContract$Factory<EngaToken>('EngaToken')

export const ControllerContract$ = fundraisingContract$Factory<Controller>('Controller')
