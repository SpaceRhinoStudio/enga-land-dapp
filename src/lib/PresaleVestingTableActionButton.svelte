<script lang="ts" context="module">
  const zone = Zone.current.fork({ name: 'User:VestingTable' })
</script>

<script lang="ts">
  import {
    distinctUntilChanged,
    exhaustMap,
    finalize,
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
  import Slide from './shared/Slide.svelte'
  import { waitingForTxAcceptController$ } from './contexts/waiting-for-tx-accept'
  import { wrapWith } from './utils/zone'

  export let meta: Vesting<Contract>

  let canRelease = false
  meta.canRelease().subscribe(x => (canRelease = x))
  let canRevoke = false
  meta.canRevoke().subscribe(x => (canRevoke = x))
  let toggle: (state?: boolean) => void

  let isLoading = false

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
      finalize(() => (isLoading = false)),
    )
  }
</script>

{#if canRelease || canRevoke}
  <Button
    {isLoading}
    job={wrapWith(zone, () =>
      canRelease
        ? toggle(true)
        : canRevoke
        ? firstValueFrom(meta.revoke().pipe(handleAction()))
        : undefined,
    )}
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
      <Button
        disabled={!!$waitingForTxAcceptController$.Display}
        job={() => toggle(false)}
        danger={!isLoading}
        className="w-32">
        <Slide visible={!isLoading}>
          {$__$.userInteraction.confirmation.cancel}
        </Slide>
        <Slide visible={isLoading}>
          {$__$.userInteraction.confirmation.close}
        </Slide>
      </Button>
      <Button
        disabled={!canRelease}
        job={wrapWith(zone, () =>
          canRelease
            ? firstValueFrom(
                of(undefined).pipe(
                  tap(() => (isLoading = true)),
                  exhaustMap(() => meta.release()),
                  handleAction(),
                ),
              ).then(() => toggle(false))
            : undefined,
        )}
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
