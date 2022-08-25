<script lang="ts">
  import { BigNumber } from 'ethers'
  import type { Sentinel } from './shared/contexts/empty-sentinel'
  import { formatCurrencyWithUnit } from './operators/currency-formatter'
  import SvgIcon from './shared/SVGIcon.svelte'
  import EngaIcon from './shared/assets/icons/enga-icon.svg'
  import _ from 'lodash'
  import { Option } from './types'

  export let className: { [key in 'container' | 'iconWrapper' | 'wrapper' | 'unit']?: string } = {}
  export let icon: any = undefined
  export let noIcon: boolean = false
  export let smallUnit: boolean = false
  export let data: Option<string | number | BigNumber | Sentinel> = undefined
  export let iconDimensions: string = '0.8rem'
</script>

<span class="flex space-x-1 items-center {className?.container}">
  {#if !noIcon}
    <SvgIcon
      Icon={_.isUndefined(icon) ? EngaIcon : icon}
      height={iconDimensions}
      width={iconDimensions}
      className={className?.iconWrapper ?? ''} />
  {/if}
  {#if $$slots.default}
    <span class={className?.wrapper}>
      <slot />
    </span>
  {/if}
  {#if data}
    <div class="flex items-baseline {className?.wrapper}">
      <span>{formatCurrencyWithUnit(data).raw}</span>
      {#if smallUnit}
        <sub class="-translate-y-0.5 {className?.unit}">
          {formatCurrencyWithUnit(data).unit}
        </sub>
      {:else}
        <span class={className?.unit}>
          {formatCurrencyWithUnit(data).unit}
        </span>
      {/if}
    </div>
  {/if}
</span>
