import { firstValueFrom, from, map, switchMap } from 'rxjs'
import { config } from '$lib/configs'
import { currentWeb3Provider$ } from '$lib/observables/selected-web3-provider'
import { switchSome, switchSomeMembers } from '$lib/operators/pass-undefined'
import { EngaTokenContract$ } from '../../contracts/fundraising-contracts'
import { providers } from 'ethers'
import { combineLatestSwitchMap } from '$lib/operators/combine-latest-switch'

export function importToken(
  provider: providers.Web3Provider,
  address: string,
  symbol: string,
  decimals: number,
  iconURL: string,
): Promise<void> {
  return provider
    .send('wallet_watchAsset', {
      //@ts-ignore
      type: 'ERC20',
      options: {
        address,
        symbol,
        decimals,
        image: iconURL,
      },
    })
    .then(() => void undefined)
}

/**
 * @description this helper function is used to import ENGA token to user's metamask token list.
 */
export function importEnga(): Promise<void> {
  return firstValueFrom(
    currentWeb3Provider$.pipe(
      switchSome(
        switchMap(x => x?.web3Provider$),
        combineLatestSwitchMap(() =>
          EngaTokenContract$.pipe(
            switchSome(
              switchMap(x =>
                from(Promise.all([Promise.resolve(x.address), x.symbol(), x.decimals()] as const)),
              ),
            ),
          ),
        ),
        switchSomeMembers(
          switchMap(([provider, [address, symbol, decimals]]) =>
            importToken(
              provider,
              address,
              symbol,
              decimals,
              window.location.origin + config.ENGAIconUrl,
            ),
          ),
        ),
      ),
      map(() => void undefined),
    ),
  )
}
