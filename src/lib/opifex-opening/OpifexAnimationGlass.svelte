<script lang="ts">
  export let isOpen: boolean
  let className: { [key in 'transitionTarget' | 'container']?: string } = {}
  export { className as class }
</script>

<svg
  class={className.container}
  id="opifex-anim-glass-glass"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 572.01 577.624">
  <defs>
    <radialGradient
      id="opifex-anim-glass-radial-gradient"
      cx="0.5"
      cy="0.636"
      r="1.139"
      gradientTransform="matrix(0, 1, -0.951, 0, 1.105, 0.136)"
      gradientUnits="objectBoundingBox">
      <stop offset="0" stop-opacity="0" />
      <stop offset="1" stop-opacity="0.694" />
    </radialGradient>
    <clipPath id="opifex-anim-glass-clip-path">
      <rect
        id="opifex-anim-glass-left_and_right_border"
        data-name="left and right border"
        width="571.918"
        height="571.918"
        fill="none" />
    </clipPath>
    <linearGradient
      id="opifex-anim-glass-linear-gradient"
      x1="0.5"
      x2="0.5"
      y2="1"
      gradientUnits="objectBoundingBox">
      <stop offset="0" stop-color="#fff" stop-opacity="0.133" />
      <stop offset="0.08" stop-color="#fff" stop-opacity="0.169" />
      <stop offset="0.22" stop-color="#fff" stop-opacity="0.235" />
      <stop offset="0.35" stop-color="#fff" stop-opacity="0.569" />
      <stop offset="0.517" stop-color="#fff" stop-opacity="0.584" />
      <stop offset="0.7" stop-color="#fff" stop-opacity="0.204" />
      <stop offset="0.87" stop-color="#fff" stop-opacity="0.043" />
      <stop offset="1" stop-color="#fff" stop-opacity="0" />
    </linearGradient>
    <linearGradient
      id="opifex-anim-glass-linear-gradient-2"
      x1="0.5"
      y1="1"
      x2="0.5"
      gradientUnits="objectBoundingBox">
      <stop offset="0" stop-color="#fff" stop-opacity="0" />
      <stop offset="0.41" stop-color="#fff" stop-opacity="0.027" />
      <stop offset="0.56" stop-color="#fff" stop-opacity="0.098" />
      <stop offset="0.83" stop-color="#fff" stop-opacity="0.325" />
      <stop offset="1" stop-color="#fff" stop-opacity="0.576" />
    </linearGradient>
  </defs>
  <path
    id="opifex-anim-glass-glass_bg"
    data-name="glass bg"
    d="M0,0H571.918V397.532L289.463,520.312,0,397.532Z"
    transform="translate(0.092 5.706)"
    class={className.transitionTarget}
    fill={isOpen ? '#3D3D3D' : '#59ecff'} />
  <path
    id="opifex-anim-glass-glass_bg_overlay"
    data-name="glass bg overlay"
    d="M0,0H571.918V397.532L289.463,520.312,0,397.532Z"
    transform="translate(0.092 5.706)"
    fill="url(#opifex-anim-glass-radial-gradient)" />
  <g
    id="opifex-anim-glass-borders"
    transform="translate(0.092 5.706)"
    clip-path="url(#opifex-anim-glass-clip-path)">
    <path
      id="opifex-anim-glass-bottom_broder"
      data-name="bottom broder"
      d="M760.97,441.8l-1.778-.762L463.44,312.665l3.557-8.2,293.95,127.586,290.717-128.3,3.6,8.176Z"
      transform="translate(-472.632 82.956)"
      fill="#303030" />
  </g>
  <rect
    id="opifex-anim-glass-top_border"
    data-name="top border"
    width="571.918"
    height="10.093"
    transform="translate(0.092)"
    fill="#262626" />
  <g id="opifex-anim-glass-reflections" transform="translate(0 10.418)">
    <path
      id="opifex-anim-glass-Path_2924"
      d="M263.336,524.435,207.026,136.32H136.72V466.6Z"
      transform="translate(-136.72 -135.581)"
      fill="url(#opifex-anim-glass-linear-gradient)" />
    <path
      id="opifex-anim-glass-Path_2926"
      d="M293.638,440.291,227.7,450.084,180.88,135h65.941Z"
      transform="translate(-81.195 -135)"
      fill="url(#opifex-anim-glass-linear-gradient-2)" />
  </g>
</svg>
