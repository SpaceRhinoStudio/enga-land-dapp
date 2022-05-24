import _ from 'lodash'

export type RouteMatchResult = {
  partial: boolean
  exact: boolean
}

function sanitizeHref(href: string) {
  return href.split('/').filter(_.negate(_.isEmpty)).join('/')
}

export function routeMatch(href: string | RegExp | undefined, pathname: string): RouteMatchResult {
  if (!_.isUndefined(href)) {
    const x = sanitizeHref(pathname)
    return {
      exact: _.isString(href) ? x === sanitizeHref(href) : href.test(x),
      partial: _.isString(href)
        ? `/${x}/`.search(`/${sanitizeHref(href)}${sanitizeHref(href).length ? '/' : ''}`) !== -1
        : false, //TODO fix partial matching for regex
    }
  }
  return { exact: false, partial: false }
}
