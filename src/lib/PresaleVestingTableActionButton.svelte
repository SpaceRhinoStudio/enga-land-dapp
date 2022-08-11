<script lang="ts">
  import {
    distinctUntilChanged,
    first,
    firstValueFrom,
    map,
    of,
    pipe,
    shareReplay,
    skip,
    switchMap,
    tap,
    throwError,
    withLatestFrom,
  } from 'rxjs'
  import Button from './shared/Button.svelte'
  import { __$ } from './shared/locales'
  import SvgIcon from './shared/SVGIcon.svelte'
  import RestrictedIcon from './shared/assets/icons/vuesax-linear-group.svg'
  import Modal from './shared/Modal.svelte'
  import Card from './Card.svelte'
  import { screen$ } from './shared/helpers/media-queries'
  import cn from 'classnames'
  import WithCurrencyIcon from './WithCurrencyIcon.svelte'
  import _ from 'lodash'
  import { Vesting } from './classes/vesting'
  import { Contract } from 'ethers'
  import { ActionStatus } from './types'
  import { allUserVestings$ } from './observables/enga/all-sales'
  import { isEqual } from './shared/utils/type-safe'
  import { flashToast$, ToastLevel } from './shared/contexts/flash-toast'

  export let meta: Vesting<Contract>

  let canRelease = false
  meta.canRelease().subscribe(x => (canRelease = x))
  let canRevoke = false
  meta.canRevoke().subscribe(x => (canRevoke = x))
  let toggle: () => void

  const handleAction = () => {
    const hasVestingsChanged$ = allUserVestings$.pipe(
      skip(1),
      distinctUntilChanged(isEqual),
      map(() => true),
      shareReplay(1),
    )
    return pipe(
      switchMap(x => (x !== ActionStatus.SUCCESS ? throwError(() => null) : of(x))),
      switchMap(() => hasVestingsChanged$),
      first(),
      withLatestFrom(__$),
      tap(([, __]) =>
        flashToast$.next({
          message: __.userInteraction.toastTitles[ToastLevel.SUCCESS],
          level: ToastLevel.SUCCESS,
        }),
      ),
    )
  }
</script>

{#if canRelease || canRevoke}
  <Button
    job={() =>
      canRelease
        ? toggle()
        : canRevoke
        ? firstValueFrom(meta.revoke().pipe(handleAction()))
        : undefined}
    disabled={!canRevoke && !canRelease}
    secondary
    className={cn('md:w-full justify-center flex', $screen$.isMobile && '!py-3 !px-7 text-base')}>
    {#if canRevoke}
      {$__$?.presale.vestings.actions.revoke.toUpperCase()}
    {:else if canRelease}
      {$__$?.presale.vestings.actions.release.toUpperCase()}
    {/if}
  </Button>
{/if}

<Modal acceptExit bind:toggle>
  <Card
    className={{
      container: cn('max-w-md w-full', $screen$.exact === 'xs' && '!rounded-b-none'),
      wrapper: 'flex flex-col gap-9',
    }}>
    <span slot="header">{$__$.presale.vestings.actions.release}</span>
    <div class="flex flex-col gap-2">
      <span>{$__$.presale.vestings.actions.ableToRelease}:</span>
      <WithCurrencyIcon data={meta.releasable()} />
    </div>
    <div class="flex justify-end gap-4 children:w-full">
      <Button job={() => toggle()} danger>
        {$__$.userInteraction.confirmation.cancel}
      </Button>
      <Button
        disabled={!canRelease}
        job={() =>
          canRelease ? firstValueFrom(meta.release().pipe(handleAction())).then(toggle) : undefined}
        className="px-10"
        active>
        {$__$.presale.vestings.actions.release}
      </Button>
    </div>
  </Card>
</Modal>

{#if !canRevoke && !canRelease}
  <div class="flex justify-start md:justify-center">
    <SvgIcon Icon={RestrictedIcon} width={'1rem'} height={'1rem'} className={'my-0.5'} />
  </div>
{/if}
