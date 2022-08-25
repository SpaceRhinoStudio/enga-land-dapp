<script lang="ts">
  import FixedRatioContainer from '$lib/FixedRatioContainer.svelte'
  import { raffleTicketPrices$ } from '$lib/observables/enga/ticketPrices'
  import { formatCurrencyWithUnit } from '$lib/operators/currency-formatter'

  import { resize_observer } from '$lib/shared/actions/resize-observer'
  import { config } from '$lib/shared/configs'

  import { ItemRarity } from '$lib/shared/types/enga'
  import cn from 'classnames'
  import { map } from 'rxjs'

  export let className: { [key in 'svg' | 'container']?: string } = {}
  export let rarity: ItemRarity
  export let overridePrice: string | undefined = undefined

  let height = 0
  const price$ = raffleTicketPrices$.pipe(map(x => formatCurrencyWithUnit(x[rarity])))
</script>

<FixedRatioContainer
  ratio={1.45318564802}
  autoWidth
  className={{ container: className?.container ?? '' }}>
  <div
    class={cn('relative select-none cursor-default')}
    use:resize_observer
    on:resize={e => (height = e.detail.height)}>
    <div
      style={cn(
        rarity !== ItemRarity.common &&
          `box-shadow: 0px 0px ${height / 2}px ${height / 14}px ${config.colors.rarity[rarity]};`,
      )}
      class="absolute z-[1] right-1 top-1/2 -translate-y-1/2 bottom-1/4 left-3/4 rounded-full" />
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class={cn('relative z-[2] h-full w-full object-contain', className?.svg)}
      viewBox="0 0 196.19 135">
      <defs>
        <linearGradient
          id="linear-gradient-raffle-ticket"
          x1="0.5"
          y1="1"
          x2="0.5"
          gradientUnits="objectBoundingBox">
          <stop offset="0" stop-color="#939598" />
          <stop offset="0.122" stop-color="#96979a" />
          <stop offset="0.214" stop-color="#9fa1a4" />
          <stop offset="0.297" stop-color="#afb1b3" />
          <stop offset="0.374" stop-color="#c6c8c9" />
          <stop offset="0.447" stop-color="#e4e4e5" />
          <stop offset="0.5" stop-color="#fff" />
          <stop offset="0.549" stop-color="#e7e7e8" />
          <stop offset="0.625" stop-color="#c8c9cb" />
          <stop offset="0.706" stop-color="#b1b2b4" />
          <stop offset="0.791" stop-color="#a0a1a4" />
          <stop offset="0.884" stop-color="#96989b" />
          <stop offset="1" stop-color="#939598" />
        </linearGradient>
        <clipPath id="clip-path-raffle-ticket">
          <rect
            id="Rectangle_25"
            data-name="Rectangle 25"
            width="154.842"
            height="108.953"
            rx="6.69"
            fill="none" />
        </clipPath>
        <radialGradient
          id="radial-gradient-raffle-ticket"
          cx="0.5"
          cy="0.5"
          r="0.5"
          gradientTransform="translate(0 0)"
          gradientUnits="objectBoundingBox">
          <stop offset="0" stop-color="#231f20" />
          <stop offset="0.328" stop-color="#494546" stop-opacity="0.827" />
          <stop offset="0.768" stop-color="#b4b3b3" stop-opacity="0.341" />
          <stop offset="1" stop-color="#fff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <g id="Group_524" data-name="Group 524" transform="translate(0 0)">
        <path
          id="Path_4"
          data-name="Path 4"
          d="M789.561,333.448l-3.685-3.258a13.659,13.659,0,0,1-4.629-10.234V295.722A13.8,13.8,0,0,0,767.38,282H611.89A13.819,13.819,0,0,0,598,295.745V403.254A13.819,13.819,0,0,0,611.89,417H767.38a13.8,13.8,0,0,0,13.867-13.722V378.545a13.659,13.659,0,0,1,4.629-10.234l3.685-3.258a13.659,13.659,0,0,0,4.629-10.234V343.682A13.658,13.658,0,0,0,789.561,333.448Z"
          transform="translate(-598 -282)"
          fill={config.colors.rarity[rarity]} />
        <g id="Group_103" data-name="Group 103" transform="translate(-524.682 -341.767)">
          <path
            id="Path_76"
            data-name="Path 76"
            d="M706.151,355.006a12.49,12.49,0,0,0-12.49-12.489H537.172a12.49,12.49,0,0,0-12.49,12.489V463.742a12.49,12.49,0,0,0,12.49,12.489H693.661a12.49,12.49,0,0,0,12.49-12.489Z"
            transform="translate(0 -0.107)"
            fill={config.colors.rarity[rarity]} />
          <g id="Group_87" data-name="Group 87" transform="translate(524.682 341.767)">
            <rect
              id="Rectangle_23"
              data-name="Rectangle 23"
              width="90.734"
              height="135"
              rx="14.571"
              transform="translate(0)"
              fill="#120c28" />
            <path
              id="Path_77"
              data-name="Path 77"
              d="M602.927,342.624a11.646,11.646,0,0,1,11.633,11.632V464.277a11.646,11.646,0,0,1-11.633,11.632H537.172a11.646,11.646,0,0,1-11.633-11.632V354.256a11.646,11.646,0,0,1,11.633-11.632h65.755m0-.857H537.172a12.49,12.49,0,0,0-12.49,12.489V464.277a12.49,12.49,0,0,0,12.49,12.489h65.755a12.49,12.49,0,0,0,12.49-12.489V354.256a12.49,12.49,0,0,0-12.49-12.489Z"
              transform="translate(-524.682 -341.767)"
              fill="url(#linear-gradient-raffle-ticket)" />
          </g>
          <rect
            id="Rectangle_24"
            data-name="Rectangle 24"
            width="154.842"
            height="108.953"
            rx="6.69"
            transform="translate(537.996 354.79)"
            fill="#190d33" />
          <g id="Group_89" data-name="Group 89" transform="translate(537.996 354.79)">
            <g
              id="Group_88"
              data-name="Group 88"
              transform="translate(0)"
              clip-path="url(#clip-path-raffle-ticket)">
              <ellipse
                id="Ellipse_11"
                data-name="Ellipse 11"
                cx="168.036"
                cy="168.074"
                rx="168.036"
                ry="168.074"
                transform="translate(-157.387 -112.74)"
                opacity="0.6"
                fill="url(#radial-gradient-raffle-ticket)" />
            </g>
          </g>
          <g id="Group_91" data-name="Group 91" transform="translate(548.075 438.562)">
            <text
              id="SOLAR"
              transform="translate(15.782 14)"
              fill="#eaeaea"
              font-size="18"
              font-family="Helvetica"
              letter-spacing="0.058em">
              <tspan x="0" y="0"> SOLAR </tspan>
            </text>
            <g id="Group_90" data-name="Group 90" transform="translate(0 1.269)">
              <path
                id="Path_78"
                data-name="Path 78"
                d="M551.974,470.6h9.112v-4.511H556.53v-4.6h-4.556Z"
                transform="translate(-551.974 -456.935)"
                fill="#eaeaea" />
              <path
                id="Path_79"
                data-name="Path 79"
                d="M557.29,456.176v4.556h4.6v4.556H566.4v-9.112Z"
                transform="translate(-552.734 -456.176)"
                fill="#eaeaea" />
            </g>
          </g>
          <g id="Group_102" data-name="Group 102" transform="translate(631.703 389.85)">
            <g id="Group_95" data-name="Group 95" transform="translate(15.988 19.909)">
              <g id="Group_93" data-name="Group 93" transform="translate(4.914)">
                <g id="Group_92" data-name="Group 92">
                  <path
                    id="Path_80"
                    data-name="Path 80"
                    d="M709.156,422.165,695.72,435.6H673.926v-1.519h21.166l12.99-12.991Z"
                    transform="translate(-673.926 -421.092)"
                    fill="#eaeaea" />
                </g>
              </g>
              <g id="Group_94" data-name="Group 94" transform="translate(0 8.577)">
                <path
                  id="Path_81"
                  data-name="Path 81"
                  d="M673.467,440.939a4.566,4.566,0,1,1,4.567-4.566A4.567,4.567,0,0,1,673.467,440.939Z"
                  transform="translate(-668.294 -431.199)"
                  fill="#070707" />
                <path
                  id="Path_82"
                  data-name="Path 82"
                  d="M673.366,441.445a5.174,5.174,0,1,0-5.173-5.174,5.18,5.18,0,0,0,5.173,5.174Zm0-9.133a3.959,3.959,0,1,1-3.958,3.959,3.963,3.963,0,0,1,3.958-3.959Z"
                  transform="translate(-668.193 -431.098)"
                  fill="#eaeaea" />
              </g>
            </g>
            <g id="Group_98" data-name="Group 98" transform="translate(0 14.243)">
              <g id="Group_96" data-name="Group 96" transform="translate(4.914 4.414)">
                <path
                  id="Path_83"
                  data-name="Path 83"
                  d="M704.417,421.15H655.273v-1.519h48.516"
                  transform="translate(-655.273 -419.631)"
                  fill="#eaeaea" />
              </g>
              <g id="Group_97" data-name="Group 97">
                <path
                  id="Path_84"
                  data-name="Path 84"
                  d="M654.814,424.322a4.566,4.566,0,1,1,4.567-4.566A4.566,4.566,0,0,1,654.814,424.322Z"
                  transform="translate(-649.641 -414.582)"
                  fill="#070707" />
                <path
                  id="Path_85"
                  data-name="Path 85"
                  d="M654.713,424.828a5.174,5.174,0,1,0-5.173-5.174,5.18,5.18,0,0,0,5.173,5.174Zm0-9.133a3.959,3.959,0,1,1-3.959,3.959,3.963,3.963,0,0,1,3.959-3.959Z"
                  transform="translate(-649.54 -414.481)"
                  fill="#eaeaea" />
              </g>
            </g>
            <g id="Group_101" data-name="Group 101" transform="translate(15.988)">
              <g id="Group_99" data-name="Group 99" transform="translate(4.914 4.414)">
                <path
                  id="Path_86"
                  data-name="Path 86"
                  d="M709.156,416.45,695.72,403.014H673.926v1.519h21.166l12.99,12.991Z"
                  transform="translate(-673.926 -403.014)"
                  fill="#eaeaea" />
              </g>
              <g id="Group_100" data-name="Group 100">
                <path
                  id="Path_87"
                  data-name="Path 87"
                  d="M673.467,398.573a4.566,4.566,0,1,0,4.567,4.566A4.567,4.567,0,0,0,673.467,398.573Z"
                  transform="translate(-668.294 -397.965)"
                  fill="#070707" />
                <path
                  id="Path_88"
                  data-name="Path 88"
                  d="M673.366,397.864a5.174,5.174,0,1,0,5.174,5.174,5.18,5.18,0,0,0-5.174-5.174Zm0,9.133a3.959,3.959,0,1,1,3.959-3.959A3.963,3.963,0,0,1,673.366,407Z"
                  transform="translate(-668.193 -397.864)"
                  fill="#eaeaea" />
              </g>
            </g>
          </g>
          <path
            id="Path_89"
            data-name="Path 89"
            d="M709.8,411.152a15.385,15.385,0,0,0-13.313-15.219V362.41a7.458,7.458,0,0,0-7.449-7.449H545.663a7.458,7.458,0,0,0-7.449,7.449v97.483a7.458,7.458,0,0,0,7.449,7.449H689.036a7.458,7.458,0,0,0,7.449-7.449V426.37A15.384,15.384,0,0,0,709.8,411.152Zm-16.742,11.86a11.939,11.939,0,0,1,0-23.721Zm-4.021,40.9H545.663a4.026,4.026,0,0,1-4.021-4.021V362.41a4.026,4.026,0,0,1,4.021-4.021H689.036a4.025,4.025,0,0,1,4.021,4.021v33.437a15.364,15.364,0,0,0,0,30.608v33.437A4.025,4.025,0,0,1,689.036,463.914Zm7.449-41.008V399.4a11.931,11.931,0,0,1,0,23.509Z"
            transform="translate(-1.933 -1.885)"
            fill="#d1d3d4" />
          <text
            id="_50K"
            data-name="50K"
            transform="translate(545.006 432.221)"
            fill="#eaeaea"
            font-size="31"
            font-family="Helvetica">
            <tspan x="0" y="0">
              {overridePrice ?? $price$}
            </tspan>
          </text>
          <circle
            id="Ellipse_12"
            data-name="Ellipse 12"
            cx="11.945"
            cy="11.945"
            r="11.945"
            transform="translate(680.547 397.322)"
            fill="#191919" />
          <path
            id="Path_90"
            data-name="Path 90"
            d="M719.374,425.953a6.524,6.524,0,1,1,6.523-6.524A6.531,6.531,0,0,1,719.374,425.953Zm0-12.19a5.667,5.667,0,1,0,5.666,5.667A5.673,5.673,0,0,0,719.374,413.763Z"
            transform="translate(-26.882 -10.163)"
            fill={config.colors.rarity[rarity]} />
        </g>
      </g>
    </svg>
  </div>
</FixedRatioContainer>
