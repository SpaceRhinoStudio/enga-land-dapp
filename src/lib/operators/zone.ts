import _ from 'lodash'
import { from, fromEventPattern, mergeMap, Observable } from 'rxjs'
import {
  HasEventTargetAddRemove,
  JQueryStyleEventEmitter,
  NodeCompatibleEventEmitter,
  NodeStyleEventEmitter,
} from 'rxjs/internal/observable/fromEvent'

// These constants are used to create handler registry functions using array mapping below.
const nodeEventEmitterMethods = ['addListener', 'removeListener'] as const
const eventTargetMethods = ['addEventListener', 'removeEventListener'] as const
const jqueryMethods = ['on', 'off'] as const

/**
 * Used to create `add` and `remove` functions to register and unregister event handlers
 * from a target in the most common handler pattern, where there are only two arguments.
 * (e.g.  `on(name, fn)`, `off(name, fn)`, `addListener(name, fn)`, or `removeListener(name, fn)`)
 * @param target The target we're calling methods on
 * @param eventName The event name for the event we're creating register or unregister functions for
 */
function toCommonHandlerRegistry(target: any, eventName: string) {
  return (methodName: string) => (handler: any) => target[methodName](eventName, handler)
}

/**
 * Checks to see if the target implements the required node-style EventEmitter methods
 * for adding and removing event handlers.
 * @param target the object to check
 */
function isNodeStyleEventEmitter(target: any): target is NodeStyleEventEmitter {
  return _.isFunction(target.addListener) && _.isFunction(target.removeListener)
}

/**
 * Checks to see if the target implements the required jQuery-style EventEmitter methods
 * for adding and removing event handlers.
 * @param target the object to check
 */
function isJQueryStyleEventEmitter(target: any): target is JQueryStyleEventEmitter<any, any> {
  return _.isFunction(target.on) && _.isFunction(target.off)
}

/**
 * Checks to see if the target implements the required EventTarget methods
 * for adding and removing event handlers.
 * @param target the object to check
 */
function isEventTarget(target: any): target is HasEventTargetAddRemove<any> {
  return _.isFunction(target.addEventListener) && _.isFunction(target.removeEventListener)
}

export function fromEventZone<T>(
  target: HasEventTargetAddRemove<T> | ArrayLike<HasEventTargetAddRemove<T>>,
  eventName: string,
): Observable<T>
export function fromEventZone(
  target: NodeStyleEventEmitter | ArrayLike<NodeStyleEventEmitter>,
  eventName: string,
): Observable<unknown>
export function fromEventZone(
  target: NodeCompatibleEventEmitter | ArrayLike<NodeCompatibleEventEmitter>,
  eventName: string,
): Observable<unknown>
export function fromEventZone<T>(
  target: JQueryStyleEventEmitter<any, T> | ArrayLike<JQueryStyleEventEmitter<any, T>>,
  eventName: string,
): Observable<T>
export function fromEventZone(target: unknown, eventName: string): Observable<unknown> {
  // Figure out our add and remove methods. In order to do this,
  // we are going to analyze the target in a preferred order, if
  // the target matches a given signature, we take the two "add" and "remove"
  // method names and apply them to a map to create opposite versions of the
  // same function. This is because they all operate in duplicate pairs,
  // `addListener(name, handler)`, `removeListener(name, handler)`, for example.
  // The call only differs by method name, as to whether or not you're adding or removing.
  const [add, remove] =
    // If it is an EventTarget, we need to use a slightly different method than the other two patterns.
    isEventTarget(target)
      ? eventTargetMethods.map(
          methodName => (handler: any) => target[methodName](eventName, handler),
        )
      : // In all other cases, the call pattern is identical with the exception of the method names.
      isNodeStyleEventEmitter(target)
      ? nodeEventEmitterMethods.map(toCommonHandlerRegistry(target, eventName))
      : isJQueryStyleEventEmitter(target)
      ? jqueryMethods.map(toCommonHandlerRegistry(target, eventName))
      : []

  // If add is falsy, it's because we didn't match a pattern above.
  // Check to see if it is an ArrayLike, because if it is, we want to
  // try to apply fromEvent to all of it's items. We do this check last,
  // because there are may be some types that are both ArrayLike *and* implement
  // event registry points, and we'd rather delegate to that when possible.
  if (!add) {
    if (_.isArrayLike(target)) {
      return mergeMap((subTarget: any) => fromEventZone(subTarget, eventName))(
        from(target),
      ) as Observable<unknown>
    }
  }

  // If add is falsy and we made it here, it's because we didn't
  // match any valid target objects above.
  if (!add) {
    throw new TypeError('Invalid event target')
  }

  //   return new Observable(subscriber => {
  //     // The handler we are going to register. Forwards the event object, by itself, or
  //     // an array of arguments to the event handler, if there is more than one argument,
  //     // to the consumer.
  //     const handler = (...args: any[]) => subscriber.next(1 < args.length ? args : args[0])
  //     // Do the work of adding the handler to the target.
  //     add(handler)
  //     // When we finalize, we want to remove the handler and free up memory.
  //     return () => remove!(handler)
  //   })

  const zone = Zone.current
  const [zoneAwareAdd, zoneAwareRemove] = [add, remove].map(
    method => (handler: any) => method?.(zone.wrap(handler, 'fromEvent')),
  )
  return fromEventPattern(zoneAwareAdd!, zoneAwareRemove!)
}
