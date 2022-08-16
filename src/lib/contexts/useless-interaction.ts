import { BehaviorSubject } from 'rxjs'

export const uselessInteractionController$ = new BehaviorSubject<{ Display: string | null }>({
  Display: null,
})
