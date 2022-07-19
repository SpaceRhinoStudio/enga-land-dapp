<script lang="ts">
  import { goto } from '$app/navigation'

  import Card from '$lib/Card.svelte'
  import PageTitle from '$lib/PageTitle.svelte'
  import Button from '$lib/shared/Button.svelte'
  import { routeConfig, Routes } from '$lib/shared/configs/routes'
  import SvgIcon from '$lib/shared/SVGIcon.svelte'
  import StakingStakeManagement from '$lib/staking/StakingStakeManagement.svelte'
  import StakingVaultCard from '$lib/staking/StakingVaultCard.svelte'
  import cn from 'classnames'
  import _ from 'lodash'
</script>

<div class="w-full flex flex-col gap-6">
  <PageTitle />
  <Card
    className={{
      wrapper:
        'flex flex-col md:flex-row flex-wrap md:items-center gap-5 md:justify-between w-full md:h-11',
    }}>
    <div class="flex flex-col md:flex-row flex-wrap md:items-center md:gap-6 gap-2">
      <div class="flex items-center gap-2">
        <span class="text-lg text-text-secondary">
          <!-- TODO ⬇️ -->
          ENGA
        </span>
        <span class="font-bold text-text-hover">
          <!-- TODO ⬇️ -->
          539
        </span>
      </div>
      <div class="hidden md:block h-10 w-0 border-r border-primary-600" />
      <div class="flex items-center gap-2">
        <span class="text-lg text-text-secondary">
          <!-- TODO ⬇️ -->
          SOLAR
        </span>
        <span class="font-bold text-text-hover">
          <!-- TODO ⬇️ -->
          539
        </span>
      </div>
      <div class="hidden md:block h-10 w-0 border-r border-primary-600" />
      <div class="flex gap-2">
        <span class="text-text-hover">23</span>
        <span class="text-text-secondary">
          <!-- TODO ⬇️ -->
          SOLAR per day
        </span>
      </div>
    </div>

    <div class="md:hidden w-full border-b border-primary-600" />
    <Button
      job={() => {
        const dest = routeConfig[Routes.tickets].href
        _.isString(dest) && goto(dest)
      }}
      className={cn(
        'border-blood border-2 text-blood font-bold flex items-center gap-2 self-end md:self-auto',
      )}>
      <SvgIcon
        width="1.5rem"
        height="1.5rem"
        Icon={routeConfig[Routes.tickets].icon}
        className="h-6" />
      <!-- TODO ⬇️ -->
      BUY TICKETS
    </Button>
  </Card>
  <div class="flex md:flex-row flex-wrap flex-col gap-6">
    <div class="cursor-pointer transition-all hover:brightness-125">
      <StakingVaultCard />
    </div>
    <div class="cursor-pointer transition-all hover:brightness-125">
      <StakingVaultCard />
    </div>
  </div>
  <StakingStakeManagement class={{ container: 'w-full' }} />
</div>
