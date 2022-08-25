<script lang="ts">
  import SvgIcon from '$lib/shared/SVGIcon.svelte'
  import cn from 'classnames'
  import leftBottom from '../../assets/cards/opifex/left bottom part.svg'
  import mid from '../../assets/cards/opifex/mid part.svg'
  import rightBottom from '../../assets/cards/opifex/right bottom part.svg'
  import OpifexAnimationGlass from './OpifexAnimationGlass.svelte'
  import OpifexAnimationTop from './OpifexAnimationTop.svelte'

  export let isOpen: boolean
  export let isLoading: boolean
  let className: { [key in 'container']?: string } = {}
  export { className as class }
  let height: number = 0
</script>

<div
  class="relative z-0 {className.container} transition-all duration-700 {isOpen
    ? 'scale-100'
    : 'scale-110'} {isOpen
    ? 'brightness-50 saturate-[0.75] opacity-90'
    : 'brightness-100 saturate-100 opacity-100'}"
  style="aspect-ratio: 56 / 100;"
  bind:clientHeight={height}>
  <div
    class="absolute z-10 top-0 left-1/2 w-full transition-all duration-[1.3s]"
    style="transform: translateY(-{isOpen
      ? 40
      : 0}%) translateX(-50%) perspective(500px) rotateX({isOpen ? 20 : 0}deg) translateZ(-{height *
      0.02}px);">
    <OpifexAnimationTop class={{ container: 'w-full' }} {isOpen} {isLoading} />
  </div>
  <OpifexAnimationGlass
    isOpen={isOpen || isLoading}
    class={{
      container: cn(
        'absolute z-10 top-[12.5%] left-1/2 -translate-x-1/2 w-full transition-all duration-[1.5s]',
      ),
      transitionTarget: 'transition-colors duration-[2s] delay-300',
    }} />

  <div
    class="absolute z-10 bottom-0 left-0 w-[36%] transition-all duration-[1.7s]"
    style="transform: translate(-{isOpen ? 20 : 0}%, calc({isOpen
      ? 50
      : 0}% - 7%)) perspective(500px) rotateX(-{isOpen ? 30 : 0}deg) translateZ(-{isOpen
      ? 0.15 * height
      : 0.05 * height}px);">
    <SvgIcon width={undefined} height={undefined} className="w-full" Icon={leftBottom} dontFill />
  </div>
  <div
    class="absolute z-10 bottom-0 right-0 w-[36%] transition-all duration-[1.7s]"
    style="transform: translate({isOpen ? 20 : 0}%, calc({isOpen
      ? 50
      : 0}% - 7%)) perspective(500px) rotateX(-{isOpen ? 30 : 0}deg) translateZ(-{isOpen
      ? 0.15 * height
      : 0.05 * height}px);">
    <SvgIcon width={undefined} height={undefined} className="w-full" Icon={rightBottom} dontFill />
  </div>
  <div
    class="absolute z-20 bottom-0 left-1/2 w-full transition-all duration-[1.5s]"
    style="transform: translateY({isOpen
      ? 10
      : 0}%) translateX(-50%) perspective(500px) rotateX(-{isOpen ? 10 : 0}deg);">
    <SvgIcon width={undefined} height={undefined} className="w-full" Icon={mid} dontFill />
  </div>
</div>
