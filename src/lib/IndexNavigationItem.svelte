<script lang="ts">
  import { goto } from '$app/navigation'
  import JigglyCard from '$lib/shared/JigglyCard.svelte'
  import cn from 'classnames'
  import Button from './shared/Button.svelte'
  import { isFirefox$ } from './shared/contexts/is-firefox'
  import { canHover$ } from './shared/helpers/media-queries'
  import SvgIcon from './shared/SVGIcon.svelte'

  export let title: string | undefined
  export let href: string
  export let Icon: any
  export let disabled: boolean
</script>

<JigglyCard className="w-[42%] md:w-[30%] lg:w-[22%] lg:m-4 sm:m-3 m-2" {disabled}>
  <Button
    {disabled}
    job={() => goto(href)}
    className={cn(
      'font-serif',
      'tracking-wide',
      'border-none',
      $isFirefox$
        ? cn('disabled:!bg-opacity-100 disabled:!bg-primary-800 disabled:brightness-75')
        : cn('backdrop-blur-xl', 'bg-opacity-50', 'disabled:bg-opacity-20'),
      'relative',
      '!md:p-8',
      '!p-7',
      'text-text-primary',
      'bg-primary-700',
      'w-full',
      'h-48',
      'flex',
      'flex-col',
      'justify-between',
      'rounded-xl',
      '!transition-all',
      'text-2xl',
      'md:text-2xll',
      'space-y-3',
      'items-center',
      'md:items-start',
      '!m-0',
      !disabled &&
        cn(
          $canHover$ &&
            cn(
              'hover:brightness-125',
              'hover:shadow-strong',
              'hover:scale-105',
              'hover:-translate-y-2',
            ),
          '!duration-700',
          'scale-100',
          'translate-y-0',
          'will-change-transform',
        ),
    )}>
    <div class="md:text-left text-center grow">{title}</div>
    <SvgIcon {Icon} width={'3rem'} height={'3rem'} className="md:self-end" />
  </Button>
</JigglyCard>
