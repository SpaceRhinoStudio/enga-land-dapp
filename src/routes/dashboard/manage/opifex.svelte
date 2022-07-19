<script lang="ts">
  import FlipCard from '$lib/FlipCard.svelte'
  import PageTitle from '$lib/PageTitle.svelte'
  import Button from '$lib/shared/Button.svelte'
  import { waitFor } from '$lib/shared/helpers/wait-for'
  import OpifexWithAnimation from '$lib/opifex-opening/OpifexWithAnimation.svelte'
  import SvgIcon from '$lib/shared/SVGIcon.svelte'
  import _ from 'lodash'
  import { firstValueFrom, timeout } from 'rxjs'
  import { SelectedWeb3Signer$ } from '$lib/observables/selected-web3-provider'
  import cn from 'classnames'
  import { EndroMeta } from '$lib/types/enga'
  import { genArr } from '$lib/shared/utils/random'
  import { rndEndro } from '$lib/helpers/random/endro'
  import { __$ } from '$lib/shared/locales'
  import OpifexOpeningModal from '$lib/opifex-opening/OpifexOpeningModal.svelte'
  import VuesaxLinearTickCircle from '$lib/shared/assets/icons/draw-transition/vuesax-linear-tick-circle.svelte'
  import Checkbox from '$lib/shared/Checkbox.svelte'

  let isOpen = true
  let shouldPulse = false
  let isLoading = false
  let flip = false
  let toggle: () => void

  let hasAgreed = false

  // DEBUG
  let endros: EndroMeta[] | undefined
  genArr(10, rndEndro).forEach(x => x.forEach(x => (endros = [...(endros ?? []), x])))
</script>

<div class="flex flex-col grow py-12 gap-12">
  <div class="flex justify-center items-center grow">
    <div class="flex flex-col-reverse sm:flex-row sm:gap-12 h-full">
      <div class={'py-16 relative z-0'}>
        <!-- Circles Background -->

        <!-- {#if !isOpen}
          <div
            transition:fade={{ duration: 1500, delay: 2000 }}
            class="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[200%] flex flex-col gap-6 justify-between">
            <div class="flex justify-end">
              <RandomTranslate
                massMultiplier={5}
                maxMove={0.7}
                className="w-fit relative right-1/4">
                <div class="h-16 w-16 border-4 border-primary-800 rounded-full" />
              </RandomTranslate>
            </div>
            <div class="flex justify-end">
              <RandomTranslate
                massMultiplier={5}
                maxMove={0.7}
                className="w-fit relative right-[6%]">
                <div class="h-12 w-12 border-4 border-primary-800 rounded-full" />
              </RandomTranslate>
            </div>
            <div class="flex justify-end">
              <RandomTranslate massMultiplier={5} maxMove={0.7} className="w-fit">
                <div class="h-8 w-8 bg-primary-800 rounded-full" />
              </RandomTranslate>
            </div>
            <div class="flex justify-start">
              <RandomTranslate massMultiplier={5} maxMove={0.7} className="w-fit">
                <div class="h-8 w-8 border-4 border-primary-800 rounded-full" />
              </RandomTranslate>
            </div>
            <div class="flex justify-start">
              <RandomTranslate
                massMultiplier={5}
                maxMove={0.7}
                className="w-fit relative left-[6%]">
                <div class="h-12 w-12 bg-primary-800 rounded-full" />
              </RandomTranslate>
            </div>
            <div class="flex justify-start">
              <RandomTranslate massMultiplier={5} maxMove={0.7} className="w-fit relative left-1/4">
                <div class="h-16 w-16 bg-primary-800 rounded-full" />
              </RandomTranslate>
            </div>
          </div>
        {/if} -->

        <div class={cn(shouldPulse ? 'animate-pulse' : 'transition-all duration-1000')}>
          <OpifexWithAnimation {isLoading} {isOpen} class={{ container: 'w-48' }} />
        </div>
      </div>
      <div class="relative z-10 flex flex-col justify-between gap-6 grow sm:py-16">
        <div class="flex flex-col gap-4">
          <span class="text-2xl font-semibold text-text-hover">Opifex Machine</span>
          <!-- TODO dummy / tl -->
          <span>Generation: 8</span>
        </div>
        <div>
          <Checkbox bind:value={hasAgreed} className={{ container: '!items-start' }}>
            <div class="w-36">
              I understand that I can only mint <strong>one</strong> Endro out of all ten choices
              and this action is <strong>irreversable</strong>
            </div>
          </Checkbox>
        </div>
        <FlipCard
          setWidthFrom="front"
          setHeightFrom="front"
          bind:backfaceVisible={flip}
          noBackfaceRender>
          <Button
            disabled={!hasAgreed}
            className="w-48 bg-primary-600 !border-none"
            job={async () => {
              isLoading = true
              try {
                await (
                  await firstValueFrom(SelectedWeb3Signer$.pipe(timeout({ first: 6000 })))
                )?.signMessage('this is a dummy message')
              } catch {
                isLoading = false
                return
              }
              await waitFor(1000)
              isOpen = false
              waitFor(8500).then(() => {
                shouldPulse = true
              })
              await waitFor(16000)
              isLoading = false
              flip = true
              shouldPulse = false
              waitFor(1500).then(() => hasAgreed && toggle())
            }}>
            <!-- TODO: tl -->
            Start Indexing
          </Button>
          <Button
            disabled={!hasAgreed}
            slot="backface"
            className="w-full flex gap-2 justify-center items-center"
            active
            job={toggle}>
            <SvgIcon
              Icon={VuesaxLinearTickCircle}
              dimensions="1.2rem"
              drawParams={{ duration: 1500 }} />
            <!-- TODO: tl -->
            <span>Ready</span>
          </Button>
        </FlipCard>
        <OpifexOpeningModal {endros} bind:toggle />
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  .fix-z-index {
    transform: translateZ(0.5rem);
  }
</style>
