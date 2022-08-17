import { contractAddresses } from '$lib/configs/contracts'
import { MarketMakerContract$ } from '../../../contracts'
import { BigNumber } from 'ethers'
import { switchSome, switchSomeMembers } from '$lib/operators/pass-undefined'
import { combineLatestWith, delay, map, of, retry, shareReplay, skip, switchMap, take } from 'rxjs'
import { selectedNetwork$ } from '../web3-network'
import type { Option$ } from '$lib/types'
import _ from 'lodash'
import { parsePPM } from '$lib/operators/web3/ppm'
import { PreSale } from '$lib/services/presale'
import { SeedSale } from '$lib/services/seedsale'
import { MarketMaker } from '$lib/services/market-maker'

//TODO: test this
export const engaPriceFromMarketMakerPPM$ = MarketMakerContract$.pipe(
  combineLatestWith(selectedNetwork$),
  switchSomeMembers(
    map(([x, network]) =>
      //TODO: maybe use the address from the first AddCollateralToken event
      contractAddresses[network]?.ERC20
        ? ([x, contractAddresses[network]!.ERC20!] as const)
        : undefined,
    ),
  ),
  switchSome(switchMap(([x, collateral]) => x.getDynamicPricePPM(collateral.address))),
  retry({ delay: () => MarketMakerContract$.pipe(skip(1), take(1)) }),
)

/**@description ENGA current price, the priority measure here is the exchange (public sale) price because other sales might not be available for all users */
export const engaPrice$: Option$<number> = MarketMaker.status$.pipe(
  switchMap(isOpen =>
    isOpen
      ? engaPriceFromMarketMakerPPM$
      : PreSale.exchangeRatePPM$.pipe(
          switchMap(x => (_.isNil(x) ? SeedSale.exchangeRatePPM$ : of(x))),
        ),
  ),
  parsePPM,
  shareReplay(1),
)

export const engaPricePPM$: Option$<BigNumber> = MarketMaker.status$.pipe(
  switchMap(isOpen => (isOpen ? engaPriceFromMarketMakerPPM$ : PreSale.exchangeRatePPM$)),
  shareReplay(1),
)
