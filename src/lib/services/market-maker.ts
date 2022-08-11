import { switchSome } from '$lib/operators/pass-undefined'
import { reEvaluateSwitchMap } from '$lib/operators/re-evaluate'
import { fromEventFilter } from '$lib/operators/web3/from-event-filter'
import { MarketMaker as MarketMakerContractType } from 'engaland_fundraising_app/typechain'
import { retry, shareReplay, skip, switchMap, take } from 'rxjs'
import { MarketMakerContract$ } from '../../contracts/fundraising-contracts'

//TODO: implement
class MarketMakerClass {
  private static _instance: MarketMakerClass
  public static getInstance(): MarketMakerClass {
    if (!MarketMakerClass._instance) {
      MarketMakerClass._instance = new MarketMakerClass()
    }
    return MarketMakerClass._instance
  }

  public readonly status$

  private constructor() {
    const statusChangeTrigger$$ = (x: MarketMakerContractType) =>
      fromEventFilter(x, x.filters.Open())

    //TODO: maker better?
    this.status$ = MarketMakerContract$.pipe(
      switchSome(
        reEvaluateSwitchMap(statusChangeTrigger$$),
        switchMap(x => x.isOpen()),
      ),
      retry({ delay: () => MarketMakerContract$.pipe(skip(1), take(1)) }),
      shareReplay(1),
    )
  }
}

export const MarketMaker = MarketMakerClass.getInstance()
