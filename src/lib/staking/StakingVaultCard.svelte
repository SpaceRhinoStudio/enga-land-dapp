<script lang="ts">
  import Card from '$lib/Card.svelte'
  import SvgIcon from '$lib/shared/SVGIcon.svelte'
  import InfoIcon from '../shared/assets/icons/vuesax-linear-info-circle.svg'
  import ExternalLinkIcon from '../shared/assets/icons/vuesax-linear-export-2.svg'
  import { flashToast$ } from '$lib/shared/contexts/flash-toast'
  import cn from 'classnames'
  import { canHover$, screen$ } from '$lib/shared/helpers/media-queries'
</script>

<Card
  className={{
    container: 'bg-primary-600',
    wrapper: 'flex gap-6 items-center justify-between',
  }}>
  <div slot="footer" class="mt-5 flex gap-2">
    <!-- TODO ⬇️ -->
    <span>Your vault balance:</span>

    <!-- TODO ⬇️ -->
    <span>23.55</span>
  </div>
  <div class="flex items-center gap-4">
    <div class="h-16 w-16 rounded-full bg-primary-800 overflow-hidden">
      <!-- TODO ⬇️ -->
      <!-- <img/> -->
    </div>

    <div class="flex flex-col h-full gap-2">
      <span class="text-lg font-bold text-text-hover">
        <!-- TODO ⬇️ -->
        ENGA
      </span>
      <div class="flex gap-2 text-sm">
        <!-- TODO ⬇️ -->
        <span>1</span>
        <!-- TODO ⬇️ -->
        <span>SOLAR per token</span>
      </div>
    </div>
  </div>
  <div
    class={cn(
      'flex flex-col gap-6 md:gap-3 h-full justify-between children:transition-all children:cursor-pointer children:w-7 md:children:w-6',
      $canHover$ && 'hover:children:text-text-hover hover:children:scale-110',
    )}>
    <SvgIcon
      height={undefined}
      width={undefined}
      Icon={InfoIcon}
      on:click={() => {
        flashToast$.next('This is just a demo!') //TODO
      }} />
    <SvgIcon
      height={undefined}
      width={undefined}
      Icon={ExternalLinkIcon}
      on:click={() => {
        flashToast$.next('This is just a demo!') //TODO
      }} />
  </div>
</Card>
