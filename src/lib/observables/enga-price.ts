import { config } from '$lib/configs'
import { fundraisingContractAddresses } from '$lib/configs/fundraising-contracts'
import { MarketMakerContract$, PreSaleContract$ } from '../../contracts/fundraising-contracts'
import { BigNumber } from 'ethers'
import { passNil } from '$lib/operators/pass-undefined'
import { withUpdatesUntilChanged } from '$lib/operators/with-updates-from'
import { map, mergeMap, Observable, retry, shareReplay, skip, switchMap, take } from 'rxjs'
import { marketMakerStatus$ } from './pre-sale/market-maker-status'
import { selectedNetwork$ } from './web3-network'

//TODO: test this
const priceFromMarketMakerPPM$ = MarketMakerContract$.pipe(
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

const priceFromPreSalePPM$ = PreSaleContract$.pipe(
  passNil(
    mergeMap(x => x.exchangeRate()),
    map(x => BigNumber.from(config.PPM).pow(2).div(x)),
  ),
)

export const engaPrice$: Observable<number | undefined | null> = marketMakerStatus$.pipe(
  switchMap(isOpen => (isOpen ? priceFromMarketMakerPPM$ : priceFromPreSalePPM$)),
  passNil(
    map(x => x.toNumber() / config.PPM),
    map(x => Number(x.toLocaleString())),
  ),
  shareReplay(1),
)

export const engaPricePPM$: Observable<BigNumber | undefined | null> = marketMakerStatus$.pipe(
  switchMap(isOpen => (isOpen ? priceFromMarketMakerPPM$ : priceFromPreSalePPM$)),
  shareReplay(1),
)
