import { ReplaySubject } from 'rxjs'

export const currentRoute$ = new ReplaySubject<string>(1)
