<script lang="ts" context="module">
  import Aggressiveness from './shared/assets/icons/god-stats/aggressiveness.svg'
  import AggressivenessTiny from './shared/assets/icons/god-stats/tiny/aggressiveness.svg'
  import CommonSkills from './shared/assets/icons/god-stats/common-skills.svg'
  import CommonSkillsTiny from './shared/assets/icons/god-stats/tiny/common-skills.svg'
  import Constitution from './shared/assets/icons/god-stats/constitution.svg'
  import ConstitutionTiny from './shared/assets/icons/god-stats/tiny/constitution.svg'
  import Dexterity from './shared/assets/icons/god-stats/dexterity.svg'
  import DexterityTiny from './shared/assets/icons/god-stats/tiny/dexterity.svg'
  import Mentality from './shared/assets/icons/god-stats/mentality.svg'
  import MentalityTiny from './shared/assets/icons/god-stats/tiny/mentality.svg'
  import Strength from './shared/assets/icons/god-stats/strength.svg'
  import StrengthTiny from './shared/assets/icons/god-stats/tiny/strength.svg'

  const ICON_MAP: { [key in GodStats]: { tiny: any; normal: any } } = {
    agg: { tiny: AggressivenessTiny, normal: Aggressiveness },
    com: { tiny: CommonSkillsTiny, normal: CommonSkills },
    con: { tiny: ConstitutionTiny, normal: Constitution },
    dex: { tiny: DexterityTiny, normal: Dexterity },
    men: { tiny: MentalityTiny, normal: Mentality },
    str: { tiny: StrengthTiny, normal: Strength },
  }
</script>

<script lang="ts">
  import SvgIcon from './shared/SVGIcon.svelte'
  import cn from 'classnames'
  import { GodStats } from './shared/types/enga'
  import type { Nil, Option } from './types'
  import { BigNumber } from 'ethers'
  import { screen$ } from './shared/helpers/media-queries'
  import _ from 'lodash'
  import { formatCurrencyWithUnit } from './operators/currency-formatter'
  import { __$ } from './shared/locales'
  import WithLoading from './shared/WithLoading.svelte'

  export let className: { [key in 'container']?: string } = {}
  export let type: GodStats
  export let value: Option<BigNumber | number | string> = undefined
  let _value: Option<string>
  $: _value = !_.isNil(value)
    ? `${
        withSign ? (Number(formatCurrencyWithUnit(value)) > 0 ? '+' : '') : ''
      }${formatCurrencyWithUnit(value)}`
    : value
  export let justIcon = false
  export let alwaysDesktop = false
  export let dimensions: string | undefined = undefined
  let _dimensions: string
  $: _dimensions =
    dimensions ??
    ($screen$.isMobile && !alwaysDesktop
      ? '1rem'
      : $screen$.isMobile && alwaysDesktop
      ? '1.7rem'
      : '2rem')
  export let withSign = false
</script>

<div class={cn('flex space-x-1 relative items-center', className.container)}>
  <SvgIcon
    Icon={$screen$.isMobile && !alwaysDesktop ? ICON_MAP[type].tiny : ICON_MAP[type].normal}
    dontFill={!($screen$.isMobile && !alwaysDesktop)}
    width={_dimensions}
    height={_dimensions}
    className={cn($screen$.isMobile && 'py-0.5', 'text-text-secondary')} />
  {#if !justIcon}
    <WithLoading data={_value} className={{ container: '!gap-0' }}>
      <span
        slot="before"
        class="font-mono scale-y-110 md:scale-y-100 scale-x-95 md:scale-x-90 flex items-center origin-left md:-mr-0.5">
        {type.toUpperCase()}
        <span class="-ml-0.5"> : </span>
      </span>
      <span slot="data" class="font-mono flex -tracking-widest">
        {_value === null ? $__$?.main.notAvailable : _value}
      </span>
    </WithLoading>
  {/if}
</div>
