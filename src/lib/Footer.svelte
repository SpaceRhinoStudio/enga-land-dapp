<script lang="ts">
  import SvgIcon from './shared/SVGIcon.svelte'
  import Logo from './shared/assets/EngalandLogo.svg'
  import Link from './shared/Link.svelte'
  import { __$ } from './shared/locales'
  import { routeConfig, Routes } from './shared/configs/routes'

  export let routes = [
    Routes.home,
    Routes.dapp,
    Routes.marketplace,
    Routes.docs,
    Routes.help,
    Routes.aboutUs,
  ]

  $: routeConfigs = routes.map(x => routeConfig[x])
  const socials = [Routes.telegram, Routes.twitter, Routes.discord, Routes.reddit].map(
    x => routeConfig[x],
  )

  export let clientHeight: number
  export let style = ''
</script>

<footer
  bind:clientHeight
  class="absolute bottom-0 bg-primary-800 !max-w-none left-1/2 -translate-x-1/2 md:shadow-float flex justify-center transition-transform duration-500"
  {style}>
  <div class="max-w-[min(calc(100%-theme(spacing.10)),theme(screens.2xl))] w-screen relative">
    <div class="container flex flex-wrap items-center justify-between mx-auto">
      <nav
        class="sm:gap-6 w-full text-text-primary flex flex-wrap items-center justify-between md:justify-center px-3 mx-auto md:px-0 pt-8">
        <Link href="/" className={{ element: 'md:ml-5' }}>
          <SvgIcon Icon={Logo} width={'6.8rem'} height={'3.1rem'} dontFill />
        </Link>
        <span class="md:order-last">
          <slot name="metadata" />
        </span>
        <div
          class="flex flex-wrap basis-auto grow-1 items-center flex-1 md:ml-12 mt-14 md:mt-0 md:px-0 px-5">
          {#each routeConfigs as x}
            <div class="mb-9 md:mb-0 mr-4">
              <Link
                href={x.href}
                disabled={x.disabled}
                className={{
                  element: 'm-2 text-lg text-text-secondary',
                }}>
                {$__$?.nav[x.id]}
              </Link>
            </div>
          {/each}
        </div>
      </nav>
      <div
        class="flex w-full items-center justify-between md:flex-row flex-col-reverse md:pt-12 pt-6 pb-8">
        <div
          class="flex flex-col md:flex-row items-center justify-center md:gap-6 md:space-y-0 space-y-6">
          <p class="m-0 text-center text-text-secondary">
            2022
            <span class="text-white ml-2">Space Rhino Studio</span>
          </p>
          <slot name="foot" />
        </div>
        <div>
          <div class="flex items-center justify-between flex-wrap md:mb-0 mb-8 gap-5">
            {#each socials as x}
              <div>
                <Link
                  href={x.href}
                  disabled={x.disabled}
                  className={{ element: 'text-text-secondary' }}>
                  <SvgIcon
                    Icon={x.icon}
                    width={'1.25rem'}
                    height={'1.25rem'}
                    className={x.disabled ? 'text-opacity-30' : ''} />
                </Link>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</footer>
