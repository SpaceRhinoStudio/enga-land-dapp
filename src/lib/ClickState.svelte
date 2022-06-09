<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  let dispatch = createEventDispatcher<{ outclick: PointerEvent; click: PointerEvent }>()
  let wrapper: HTMLElement
  export let exclude: HTMLElement | undefined = undefined
  let _exclude: HTMLElement | undefined = undefined

  export let clickState = false
  export const dismiss = () => {
    clickState = false
  }
  export let toggle = true
</script>

<svelte:window
  on:pointerdown={e => {
    if (
      //@ts-ignore
      !wrapper.contains(e.target) &&
      //@ts-ignore
      (exclude ?? _exclude ? !(exclude ?? _exclude).contains(e.target) : true)
    ) {
      dispatch('outclick', e)
      clickState = false
    }
    if (
      //@ts-ignore
      wrapper.contains(e.target) &&
      //@ts-ignore
      (exclude ?? _exclude ? !(exclude ?? _exclude).contains(e.target) : true)
    ) {
      dispatch('click', e)
      if (toggle) {
        clickState = !clickState
      } else {
        clickState = true
      }
    }
  }} />

<div class="contents" bind:this={wrapper}>
  <slot {clickState} {dismiss} />
  <div class="contents" bind:this={_exclude}>
    <slot name="exclude" {clickState} {dismiss} />
  </div>
</div>
