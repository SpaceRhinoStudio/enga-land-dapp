import { config } from '$lib/configs'
import { BehaviorSubject, Observable, timer } from 'rxjs'

export const pageLoadingJobs$ = new BehaviorSubject<Promise<unknown> | Observable<unknown>>(
  timer(config.Delays.mainLoadingMin),
)
