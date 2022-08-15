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
  import { firstValueFrom, from, mergeMap, toArray, map, mergeAll, tap, switchMap } from 'rxjs'
  import { ajax } from 'rxjs/ajax'
  import { config } from './configs'
  import CloseIcon from '$lib/shared/assets/icons/close-sidebar.svg'

  const copy = (msg: string) => {
    if (clipboardCopy(msg)) {
      flashToast$.next({ level: ToastLevel.SUCCESS, message: 'Done' })
    } else {
      flashToast$.next({ level: ToastLevel.ERROR, message: 'Failed' })
    }
  }

  let toggle: () => void
  const getId = () => localStorage.getItem('debug-id')

  $: copyId = () => {
    copy(getId() ?? 'undefined')
  }
  const getLogList = () => localStorage.getItem('debug-sent') ?? '[]'
  $: copyLog = () => {
    copy(getLogList())
  }
  $: getLogs = () =>
    firstValueFrom(
      from(JSON.parse(getLogList()) as string[]).pipe(
        mergeMap(logId =>
          ajax<LogResponse>({
            method: 'GET',
            url: `${config.apiAddress}/debug/log?id=${getId()}__${logId}`,
          }).pipe(
            map(x => JSON.parse(x.response.data)),
            map(x => ({ id: logId, data: x })),
          ),
        ),
        toArray(),
        map(x =>
          x.sort((a, b) => {
            const aSplit = a.id.split('__')
            const bSplit = b.id.split('__')
            return Number(aSplit[aSplit.length - 1]) - Number(bSplit[bSplit.length - 1])
          }),
        ),
        map(x =>
          x.map(x => {
            const xSplit = x.id.split('__')
            return {
              id: x.id,
              time: new Date(Number(xSplit[xSplit.length - 1])).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              }),
            }
          }),
        ),
        switchMap(x => {
          return ajax<DPasteResponse>({
            method: 'POST',
            url: 'https://api.paste.ee/v1/pastes',
            headers: { 'X-Auth-Token': 'aGLP8tt4366LWCMyfWWKumdZUNnmRsi4L7PzwmgTo' },
            body: {
              description: getId(),
              sections: [
                { name: 'logs', syntax: 'json', contents: JSON.stringify(x, undefined, 2) },
              ],
            },
          })
        }),
        map(x => x.response.link),
        tap(copy),
      ),
    )

  const killDebugId = () => {
    localStorage.removeItem('debug-id')
    localStorage.removeItem('debug-sent')
    location.reload()
  }
</script>

<Button job={toggle} className="!p-2 h-full">
  <SvgIcon Icon={BugIcon} dimensions="1.5rem" />
</Button>

<!-- TODO: tl ⬇️ -->
<Modal bind:toggle acceptExit>
  <Card className={{ wrapper: 'flex flex-col gap-6 w-screen max-w-sm' }}>
    <div slot="header" class="flex justify-between items-center w-full">
      <span>Debug</span>
      <SvgIcon dimensions="1.5rem" Icon={CloseIcon} on:click={toggle} className="cursor-pointer" />
    </div>
    <Button job={clearCache}>Clear cache</Button>
    <div slot="footer" class="flex flex-col gap-4 pt-5 w-full">
      <div class="flex gap-3 justify-between">
        <span class="text- leading-none">Debug ID:</span>
        <span class="font-mono">{getId()}</span>
      </div>
      <Button job={copyId}>Copy debug ID</Button>
      <Button job={copyLog}>Copy log list</Button>
      <Button job={getLogs}>Copy all logs</Button>
      <Button danger job={killDebugId}>Clear debug ID</Button>
    </div>
  </Card>
</Modal>
