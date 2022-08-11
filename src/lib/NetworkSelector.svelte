<script lang="ts" context="module">
  const zone = Zone.current.fork({ name: 'UserNetworkSelectDropdown' })
</script>

<script lang="ts">
  import _ from 'lodash'
  import { selectedNetwork$, networkController$ } from './observables/web3-network'
  import Select from './Select.svelte'
  import { config } from './configs'
  import { __$ } from './shared/locales'
  import { filter } from 'rxjs'
  import { noUndefined } from './shared/utils/no-sentinel-or-undefined'
  import { currentWeb3ProviderId$ } from './observables/selected-web3-provider'

  const liveNetworks = _.filter(config.Chains, val => val.isLive)
  const testNetworks = _.filter(config.Chains, val => !val.isLive)

  const handleChange = (e: CustomEvent<string>) => {
    zone.run(() => {
      networkController$.next({ Request: e.detail })
    })
  }

  const selected$ = selectedNetwork$.pipe(filter(noUndefined))
</script>

<Select
  value={$selected$ ?? undefined}
  on:change={handleChange}
  isLoading={$currentWeb3ProviderId$ === undefined}>
  <optgroup label={$__$?.web3Provider.networks.live}>
    {#each liveNetworks as x}
      <option value={x.network.name}>
        {x.config.chainName}
      </option>
    {/each}
  </optgroup>
  <optgroup label={$__$?.web3Provider.networks.test}>
    {#each testNetworks as x}
      <option value={x.network.name}>
        {x.config.chainName}
      </option>
    {/each}
  </optgroup>
</Select>
