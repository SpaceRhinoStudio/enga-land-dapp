<script lang="ts" context="module">
  import Aggressiveness from '../assets/icons/god-stats/aggressiveness.svg'
  import AggressivenessTiny from '../assets/icons/god-stats/tiny/aggressiveness.svg'
  import CommonSkills from '../assets/icons/god-stats/common-skills.svg'
  import CommonSkillsTiny from '../assets/icons/god-stats/tiny/common-skills.svg'
  import Constitution from '../assets/icons/god-stats/constitution.svg'
  import ConstitutionTiny from '../assets/icons/god-stats/tiny/constitution.svg'
  import Dexterity from '../assets/icons/god-stats/dexterity.svg'
  import DexterityTiny from '../assets/icons/god-stats/tiny/dexterity.svg'
  import Mentality from '../assets/icons/god-stats/mentality.svg'
  import MentalityTiny from '../assets/icons/god-stats/tiny/mentality.svg'
  import Strength from '../assets/icons/god-stats/strength.svg'
  import StrengthTiny from '../assets/icons/god-stats/tiny/strength.svg'

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
  import Fade from './Fade.svelte'
  import LoadingSpinner from './LoadingSpinner.svelte'
  import SvgIcon from './SVGIcon.svelte'
  import cn from 'classnames'
  import { GodStats } from './types/enga'
  import type { Nil } from './types'
  import { BigNumber } from 'ethers'
  import { screen$ } from './helpers/media-queries'
  import _ from 'lodash'
  import { formatCurrencyWithUnit } from './operators/currency-formatter'
  import { __$ } from './locales'
  import WithLoading from './WithLoading.svelte'

  export let className: { [key in 'container']?: string } = {}
  export let type: GodStats
  export let value: BigNumber | number | string | Nil = undefined
  let _value: string | Nil
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
    <WithLoading data={_value}>
      <span slot="before">{type.toUpperCase()}:</span>
      <span slot="data">
        {_value === null ? $__$?.main.notAvailable : _value}
      </span>
    </WithLoading>
  {/if}
</div>
