import _ from 'lodash'
import { onMount } from 'svelte'
import { Readable, writable } from 'svelte/store'
import { Spring, SpringConfig } from 'wobble'

export function useWobble(
  config: Partial<SpringConfig>,
): [
  store: Readable<number>,
  set: (value: number | Partial<SpringConfig>) => void,
  spring: { current: Spring },
] {
  const spring = {
    //@ts-ignore
    current: {
      onUpdate: (x: unknown) => void x,
      start: () => undefined,
      updateConfig: (x: unknown) => void x,
    } as Spring,
  }
  onMount(() => {
    spring.current = new Spring(
      config.fromValue !== undefined ? config : { ...config, fromValue: 0 },
    )
    spring.current.onUpdate(x => {
      store.set(x.currentValue)
    })
  })
  const store = writable(config.fromValue ?? 0)
  spring.current.start()
  return [
    store,
    value => {
      if (_.isNumber(value)) {
        spring.current.updateConfig({ toValue: value })
      } else {
        spring.current.updateConfig(value)
      }
      spring.current.start()
    },
    spring,
  ]
}
