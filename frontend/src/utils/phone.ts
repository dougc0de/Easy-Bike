const NICARAGUA_LOCAL_LENGTH = 8

export const NICARAGUA_PHONE_PLACEHOLDER = '1234-5678'
export const NICARAGUA_PHONE_MAX_LENGTH = NICARAGUA_PHONE_PLACEHOLDER.length

function extractLocalDigits(value: string) {
  const digits = value.replace(/\D/g, '')

  return digits.slice(0, NICARAGUA_LOCAL_LENGTH)
}

export function formatNicaraguaPhone(value: string) {
  const localDigits = extractLocalDigits(value)

  if (!localDigits) return ''
  if (localDigits.length <= 4) return localDigits

  return `${localDigits.slice(0, 4)}-${localDigits.slice(4)}`
}

export function isCompleteNicaraguaPhone(value: string) {
  return extractLocalDigits(value).length === NICARAGUA_LOCAL_LENGTH
}
