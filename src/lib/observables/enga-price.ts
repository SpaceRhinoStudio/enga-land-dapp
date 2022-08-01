import { config } from '$lib/configs'
import { fundraisingContractAddresses } from '$lib/configs/fundraising-contracts'
import {
  MarketMakerContract$,
  PreSaleContract$,
  SeedSaleContract$,
} from '../../contracts/fundraising-contracts'
import { BigNumber } from 'ethers'
import { passNil } from '$lib/operators/pass-undefined'
import { withUpdatesFrom, withUpdatesUntilChanged } from '$lib/operators/with-updates-from'
import {
  map,
  Observable,
  of,
  OperatorFunction,
  retry,
  shareReplay,
  skip,
  switchMap,
  take,
} from 'rxjs'
import { marketMakerStatus$ } from './pre-sale/market-maker-status'
import { selectedNetwork$ } from './web3-network'
import type { Nil } from '$lib/types'
import _ from 'lodash'
import { preSaleStatus$ } from './pre-sale/status'
import { PreSaleStatus } from '$lib/operators/pre-sale/status'
import { seedSaleStatus$ } from './seed-sale/status'
import { SeedSaleStatus } from '$lib/operators/seed-sale/status'

//TODO: test this
export const engaPriceFromMarketMakerPPM$ = MarketMakerContract$.pipe(
  passNil(
    withUpdatesUntilChanged(selectedNetwork$),
    map(([x, network]) =>
      //TODO: maybe use the address from the first AddCollateralToken event
      fundraisingContractAddresses[network]?.ERC20
        ? ([x, fundraisingContractAddresses[network]!.ERC20!] as const)
        : undefined,
    ),
  ),
  passNil(switchMap(([x, collateral]) => x.getDynamicPricePPM(collateral.address))),
  retry({ delay: () => MarketMakerContract$.pipe(skip(1), take(1)) }),
)

export const engaPriceFromPreSalePPM$ = PreSaleContract$.pipe(
  passNil(
    switchMap(x => x.exchangeRate()),
    map(x => BigNumber.from(config.PPM).pow(2).div(x)),
  ),
  withUpdatesFrom(preSaleStatus$),
  map(([x, status]) => (status === PreSaleStatus.Funding ? x : null)),
)

export const engaPriceFromSeedSalePPM$ = SeedSaleContract$.pipe(
  passNil(
    switchMap(x => Promise.all([x.engaGoal(), x.daiGoal()])),
    map(([engaGoal, daiGoal]) => daiGoal.mul(BigNumber.from(config.PPM)).div(engaGoal)),
  ),
  withUpdatesFrom(seedSaleStatus$),
  map(([x, status]) => (status === SeedSaleStatus.Funding ? x : null)),
)

/**@description utility to parse PPM to human readable number */
export const parsePPM: OperatorFunction<BigNumber | Nil, number | Nil> = passNil(
  map(x => x.toNumber() / config.PPM),
  map(x => Number(x.toLocaleString())),
)

/**@description ENGA current price, the priority measure here is the exchange (public sale) price because other sales might not be available for all users */
export const engaPrice$: Observable<number | Nil> = marketMakerStatus$.pipe(
  switchMap(isOpen =>
    isOpen
      ? engaPriceFromMarketMakerPPM$
      : engaPriceFromPreSalePPM$.pipe(
          switchMap(x => (_.isNil(x) ? engaPriceFromSeedSalePPM$ : of(x))),
        ),
  ),
  parsePPM,
  shareReplay(1),
)

export const engaPricePPM$: Observable<BigNumber | Nil> = marketMakerStatus$.pipe(
  switchMap(isOpen => (isOpen ? engaPriceFromMarketMakerPPM$ : engaPriceFromPreSalePPM$)),
  shareReplay(1),
)
