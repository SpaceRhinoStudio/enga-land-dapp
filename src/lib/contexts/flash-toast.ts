import { Subject } from 'rxjs'

export enum ToastType {
  success,
  alert,
  info,
  warning,
  error,
}

export type DetailedToast = {
  message: string
  timeout?: number
  level?: ToastType
}

export const flashToast$ = new Subject<string | DetailedToast>()
