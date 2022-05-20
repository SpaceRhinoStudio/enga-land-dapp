<script lang="ts">
  import { shortenString } from './utils/shorten-string'

  export let className = ''
  export let hash: string
  export let leading = 2
  export let trailing = 4
</script>

<span class={className}>
  <span class="font-mono">
    {shortenString(hash, leading, {
      trimEnd: true,
    })
      ?.replace('...', '')
      .toUpperCase()
      .replace('0X', '0x')}
  </span>
  <span>...</span>
  <span class="font-mono">
    {shortenString(hash, trailing, {
      trimStart: true,
    })
      ?.replace('...', '')
      .toUpperCase()}
  </span>
</span>
