<script lang="ts">
  import { onDestroy } from 'svelte'

  export let isOpen: boolean
  export let isLoading: boolean
  let className: { [key in 'container']?: string } = {}
  export { className as class }

  let length = 15

  let singleDuration = 300
  let introDuration = 7000
  let introDelay = 1500
  let outroDuration = 500
  let isIntroOver = false
  let progressIndex: number | null = null
  const getIndex = () => progressIndex
  let gradOffset = 3
  $: !isOpen &&
    setTimeout(() => {
      isIntroOver = true
    }, introDelay + introDuration)

  $: interval = isIntroOver
    ? setInterval(() => {
        progressIndex = ((getIndex() ?? 0) + 1) % length
      }, singleDuration / 3)
    : undefined

  $: !isLoading && clearInterval(interval)

  onDestroy(() => {
    clearInterval(interval)
  })

  $: delayOf = (i: number) =>
    isLoading
      ? isIntroOver
        ? 0
        : i * (introDuration / length) + introDelay
      : i * (outroDuration / length)

  $: colorOf = (i: number) => {
    if (isOpen) {
      return '#FF4622'
    }
    if (!isLoading) {
      return 'hsl(110, 100%, 48%)'
    }
    if (!isIntroOver || progressIndex === null) {
      return 'hsl(44, 100%, 48%)'
    }
    let diff = Math.abs(progressIndex - i)
    if (diff < gradOffset && length - diff < gradOffset) {
      diff = length - diff
    }
    if (diff < gradOffset) {
      return `hsl(${(1 - diff / gradOffset) * (110 - 44) + 44}, 100%, 48%)`
    }
    return 'hsl(44, 100%, 48%)'
  }

  $: lights = Array(length)
    .fill(undefined)
    .map((_, i) => ({
      x: 206.183 + i * 11.2,
    }))
</script>

<svg
  data-name="top part"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 576.376 135.323"
  class={className.container}>
  <path
    d="M531.021,77.83H825.179a6.121,6.121,0,0,1,6.121,6.121v24.99H524.9V83.951A6.12,6.12,0,0,1,531.021,77.83Z"
    transform="translate(-389.9 -77.83)"
    fill="#1e1e1e" />
  <path
    d="M479.222,77.83h24.99a3.049,3.049,0,0,1,3.049,3.049v28.062H476.15V80.879a3.049,3.049,0,0,1,3.072-3.049Z"
    transform="translate(-453.746 -77.83)"
    fill="#1e1e1e" />
  <path
    d="M499.6,77.83h25.014a3.049,3.049,0,0,1,3,3.049v28.062H496.55V80.879A3.049,3.049,0,0,1,499.6,77.83Z"
    transform="translate(-427.029 -77.83)"
    fill="#1e1e1e" />
  <rect width="571.918" height="101.232" transform="translate(2.24 31.111)" fill="#62657e" />
  <path
    d="M1042.826,196.043H466.45V90.33h576.376Zm-571.918-4.458h567.46V94.811H470.931Z"
    transform="translate(-466.45 -61.459)"
    fill="#dcefff" />
  <rect width="414.399" height="104.212" transform="translate(2.24 31.111)" fill="#767e94" />
  <rect width="73.794" height="104.212" transform="translate(88.067 31.111)" fill="#9ea4b1" />
  <rect width="14.412" height="99.708" transform="translate(2.24 31.111)" fill="#babace" />
  <rect width="15.29" height="99.708" transform="translate(558.868 31.111)" fill="#434a72" />
  <rect width="571.918" height="5.936" transform="translate(2.195 78.251)" fill="#3b3f59" />
  <rect width="183.895" height="49.496" transform="translate(196.206 56.447)" fill="#3b3f59" />
  {#each lights as light, i}
    <rect
      data-name={i}
      width="7.137"
      height="32.682"
      transform="translate({light.x} 64.856)"
      style="transition-delay: {delayOf(i)}ms; transition-duration: {singleDuration}ms;"
      fill={colorOf(i)} />
  {/each}
</svg>
