<script lang="ts" context="module">
  type LogResponse = { data: string }
  type DPasteResponse = { id: string; link: string }
</script>

<script lang="ts">
  import BugIcon from '$lib/shared/assets/icons/bug.svg'
  import SvgIcon from '$lib/shared/SVGIcon.svelte'
  import Button from '$lib/shared/Button.svelte'
  import Modal from './shared/Modal.svelte'
  import Card from './Card.svelte'
  import clipboardCopy from 'copy-to-clipboard'
  import { flashToast$, ToastLevel } from './shared/contexts/flash-toast'
  import { clearCache } from './operators/web3/provider'
  import { firstValueFrom, map, tap } from 'rxjs'
  import { ajax } from 'rxjs/ajax'
  import { config } from './configs'
  import CloseIcon from '$lib/shared/assets/icons/close-sidebar.svg'
  import { localCache } from './contexts/local-cache'
  import { Serializable } from './types'
  import _ from 'lodash'

  const copy = (msg: string) => {
    if (clipboardCopy(msg)) {
      flashToast$.next({ level: ToastLevel.SUCCESS, message: 'Done' })
    } else {
      flashToast$.next({ level: ToastLevel.ERROR, message: 'Failed' })
    }
  }

  const logs$ = localCache.observe<{ [title: string]: Serializable[] }>('logs', {})

  let toggle: () => void
  const id = localStorage.getItem('debug-id')

  $: copyId = () => {
    copy(id ?? 'undefined')
  }
  $: copyLog = () => {
    copy(JSON.stringify(_.keys($logs$)))
  }
  $: getLogs = () => {
    const now = Date.now()
    return firstValueFrom(
      ajax({
        method: 'POST',
        url: `${config.apiAddress}/debug/log`,
        body: {
          id: `${id}__${now}`,
          message: JSON.stringify($logs$),
        },
      }).pipe(
        map(() => `${config.apiAddress}/debug/log?id=${id}__${now}`),
        tap(copy),
      ),
    )
  }

  const killDebugId = () => {
    logs$.next({})
    localStorage.removeItem('debug-id')
    setTimeout(() => {
      location.reload()
    }, 100)
  }
</script>

<Button job={toggle} className="!p-2 h-full">
  <SvgIcon Icon={BugIcon} dimensions="1.5rem" />
</Button>

<!-- TODO: tl ⬇️ -->
<Modal bind:toggle acceptExit>
  <Card className={{ wrapper: 'flex flex-col gap-6 w-screen max-w-xs' }}>
    <div slot="header" class="flex justify-between items-center w-full">
      <span>Debug</span>
      <SvgIcon dimensions="1.5rem" Icon={CloseIcon} on:click={toggle} className="cursor-pointer" />
    </div>
    <Button job={clearCache}>Clear cache</Button>
    <div slot="footer" class="flex flex-col gap-4 pt-5 w-full">
      <div class="flex gap-3 justify-between">
        <span class="text- leading-none">Debug ID:</span>
        <span class="font-mono">{id}</span>
      </div>
      <Button job={copyId}>Copy debug ID</Button>
      <Button job={copyLog}>Copy log list</Button>
      <Button job={getLogs}>Copy all logs</Button>
      <Button danger job={killDebugId}>Clear debug ID</Button>
    </div>
  </Card>
</Modal>
