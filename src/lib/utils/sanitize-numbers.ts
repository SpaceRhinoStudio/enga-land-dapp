export function sanitizeNumbers(str: string): string {
  return str
}
export function onlyNumbers(str: string): string {
  return sanitizeNumbers(str).replace(/[^0-9.]/g, '')
}
