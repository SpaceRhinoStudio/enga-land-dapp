import { combineLatest, distinctUntilChanged, map, shareReplay, startWith } from 'rxjs'
import { SelectedWeb3SignerWithAddress$ } from './selected-web3-provider'
import { fallbackWeb3Provider$ } from './web3-providers/fallback-provider'

export const signerOrProvider$ = combineLatest({
  provider: fallbackWeb3Provider$.pipe(startWith(undefined), distinctUntilChanged()),
  signer: SelectedWeb3SignerWithAddress$.pipe(startWith(undefined), distinctUntilChanged()),
}).pipe(
  map(({ provider, signer }) => signer ?? provider),
  shareReplay(1),
)
