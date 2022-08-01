import { firstValueFrom, switchMap, take } from 'rxjs'

import { config } from '$lib/configs'
import { SelectedWeb3ProviderMeta$ } from '$lib/observables/selected-web3-provider'
import { passNil } from '$lib/operators/pass-undefined'
import { EngaTokenContract$ } from '../../contracts/fundraising-contracts'

/**
 * @description this helper function is used to import ENGA token to user's metamask token list.
 */
export async function importEnga(): Promise<void> {
  await firstValueFrom(
    SelectedWeb3ProviderMeta$.pipe(
      passNil(
        switchMap(x => x?.web3Provider$),
        switchMap(provider =>
          EngaTokenContract$.pipe(
            take(3),
            switchMap(
              async x =>
                [provider, [x?.address, await x?.symbol(), await x?.decimals()] as const] as const,
            ),
          ),
        ),
        switchMap(([x, [address, symbol, decimals]]) =>
          x.send('wallet_watchAsset', {
            //@ts-ignore
            type: 'ERC20',
            options: {
              address,
              symbol,
              decimals,
              image: config.ENGAIconUrl,
            },
          }),
        ),
      ),
    ),
  )
}
