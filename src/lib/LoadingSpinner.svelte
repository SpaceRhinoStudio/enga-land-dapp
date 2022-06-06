<script lang="ts">
  export let className = ''
</script>

<div
  class={`
    spinner
    relative
    children:border-white
    children:rounded-full
    children:absolute
    ${className}
  `}>
  <div />
  <div />
  <div />
</div>

<style lang="postcss">
  @keyframes rotateLoadingSpinnerT {
    0% {
      transform: translate(0, 0);
    }

    33% {
      transform: translateX(calc((var(--containerDimensions) - var(--subjectDimensions)) / 2))
        translateY(calc(var(--containerDimensions) - var(--subjectDimensions)));
    }

    66% {
      transform: translateX(
          calc(-1 * ((var(--containerDimensions) - var(--subjectDimensions)) / 2))
        )
        translateY(calc(var(--containerDimensions) - var(--subjectDimensions)));
    }
    100% {
      transform: translate(0, 0);
    }
  }

  @keyframes rotateLoadingSpinnerBR {
    0% {
      transform: translate(0, 0);
    }

    33% {
      transform: translateX(calc(-1 * ((var(--containerDimensions) - var(--subjectDimensions)))))
        translateY(0);
    }

    66% {
      transform: translateX(
          calc(-1 * ((var(--containerDimensions) - var(--subjectDimensions)) / 2))
        )
        translateY(calc(-1 * (var(--containerDimensions) - var(--subjectDimensions))));
    }

    100% {
      transform: translate(0, 0);
    }
  }

  @keyframes rotateLoadingSpinnerBL {
    0% {
      transform: translate(0, 0);
    }

    33% {
      transform: translateX(calc(((var(--containerDimensions) - var(--subjectDimensions)) / 2)))
        translateY(calc(-1 * (var(--containerDimensions) - var(--subjectDimensions))));
    }

    66% {
      transform: translateX(calc(((var(--containerDimensions) - var(--subjectDimensions)))))
        translateY(0);
    }

    100% {
      transform: translate(0, 0);
    }
  }

  .spinner {
    /* --containerDimensions: calc(1.25rem + (3.75rem * var(--big, 0))); */
    --containerDimensions: 5em;
    /* --subjectDimensions: calc(0.5rem + (1.25rem * var(--big, 0))); */
    --subjectDimensions: 2em;
    --duration: 2s;
    /* width: var(--containerDimensions); */
    width: calc(1em + (4em * var(--big, 0)));
    /* height: var(--containerDimensions); */
    height: calc(1em + (4em * var(--big, 0)));

    transform: scale(calc(20% + (var(--big, 0) * 80%)))
      translate(calc(-180% + (var(--big, 0) * 180%)), calc(-180% + (var(--big, 0) * 180%)));

    div {
      width: var(--subjectDimensions);
      height: var(--subjectDimensions);
      /* border-width: calc(1px + (var(--big, 0) * 3px)); */
      border-width: 4px;

      animation-duration: var(--duration);
      animation-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
      animation-iteration-count: infinite;
      animation-fill-mode: forwards;

      &:nth-child(1) {
        animation-name: rotateLoadingSpinnerT;
        top: 0;
        left: calc((var(--containerDimensions) / 2) - (var(--subjectDimensions) / 2));
      }
      &:nth-child(2) {
        animation-name: rotateLoadingSpinnerBR;
        top: calc(var(--containerDimensions) - var(--subjectDimensions));
        left: calc(var(--containerDimensions) - var(--subjectDimensions));
      }
      &:nth-child(3) {
        animation-name: rotateLoadingSpinnerBL;
        top: calc(var(--containerDimensions) - var(--subjectDimensions));
        left: 0;
      }
    }
  }
</style>
