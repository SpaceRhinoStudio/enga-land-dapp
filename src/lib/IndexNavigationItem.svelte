<script lang="ts">
  import { goto } from '$app/navigation'
  import JigglyCard from '$lib/JigglyCard.svelte'
  import Button from './Button.svelte'
  import SvgIcon from './SVGIcon.svelte'

  export let title: string | undefined
  export let href: string
  export let Icon: any
  export let disabled: boolean
</script>

<JigglyCard className="w-[42%] md:w-[30%] lg:w-[22%] lg:m-4 sm:m-3 m-2" {disabled}>
  <Button
    {disabled}
    job={() => goto(href)}
    className={`
        font-serif
        tracking-wide
        border-none
        backdrop-blur-xl
        relative
        !md:p-8
        !p-7
        text-text-primary
        bg-primary-700
        w-full
        h-[18vh]
        flex
        flex-col
        justify-between
        min-h-[168px]
        rounded-xl
        bg-opacity-50
        disabled:bg-opacity-20
        disabled:hover:brightness-100
        hover:brightness-125
        !transition-all
        text-2xl
        md:text-2xll
        space-y-3
        items-center
        md:items-start
        !m-0
        ${
          !disabled
            ? 'hover:shadow-strong !duration-700 scale-100 translate-y-0 hover:scale-105 hover:-translate-y-2 will-change-transform'
            : ''
        }
  `}>
    <div class="md:text-left text-center grow">{title}</div>
    <SvgIcon {Icon} width={'3rem'} height={'3rem'} className="md:self-end" />
  </Button>
</JigglyCard>
