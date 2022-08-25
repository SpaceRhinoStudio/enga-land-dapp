<script lang="ts">
  import _ from 'lodash'

  import { __$ } from './shared/locales'
  import SvgIcon from './shared/SVGIcon.svelte'
  import WithLoading from './shared/WithLoading.svelte'
  import TickSquareIcon from './shared/assets/icons/vuesax-linear-tick-square.svg'
  import TickSquareEmptyIcon from './shared/assets/icons/vuesax-linear-tick-square-empty.svg'
  import {
    termsAndConditionsAgreements$,
    termsAndConditionsAgreementsController$,
  } from './observables/terms-and-condition-agreement'
  import { flashToast$, ToastLevel } from './shared/contexts/flash-toast'
  import { Option } from './types'
  import { debounceTime } from 'rxjs'

  const hasAgreed$ = termsAndConditionsAgreements$.pipe(debounceTime(500))
  let hasAgreed: Option<boolean> = undefined
  $: hasAgreed = $hasAgreed$
  export { hasAgreed }

  $: handleAgree = () => {
    if (_.isUndefined(hasAgreed)) {
      return
    }
    if (hasAgreed) {
      __$.subscribe(__ =>
        flashToast$.next({
          message: __.presale.errors.cannotRemoveAgreement,
          level: ToastLevel.ERROR,
        }),
      )
      return
    }
    termsAndConditionsAgreementsController$.next({
      Request: true,
    })
  }
</script>

<div class="flex items-center cursor-pointer text-xs" on:click={handleAgree}>
  <WithLoading
    data={_.isUndefined(hasAgreed)}
    predicate={e => !e}
    className={{ container: 'flex !gap-2' }}>
    <svelte:fragment slot="data">
      {#if !!hasAgreed}
        <SvgIcon Icon={TickSquareIcon} width="1.25rem" height="1.25rem" />
      {/if}
      {#if !hasAgreed}
        <SvgIcon Icon={TickSquareEmptyIcon} width="1.25rem" height="1.25rem" />
      {/if}
    </svelte:fragment>
    <span slot="after" class="text-text-secondary text-2xs cursor-pointer">
      {$__$?.presale.contribution.termsNotice}
    </span>
  </WithLoading>
</div>
