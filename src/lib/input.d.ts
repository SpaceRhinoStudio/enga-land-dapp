export type InputComponentError = string | undefined
export type InputControl = Partial<{
  Disable: boolean
  Value: string
  Errors: InputComponentError[]
  Loading: boolean
  LastKeyStroke: string
  Reset: true
}>
