import { formatWithThousandSeparator } from '@/lib/utils'

export const getMonthShortName = (month: number): string =>
  new Date(0, month).toLocaleString('id-ID', { month: 'short' })

export const getTotalAfterTax = (subtotal: number, tax = 0, discount = 0) => {
  return formatWithThousandSeparator(
    subtotal * (1 - (discount || 0) / 100) * (1 + (tax || 0) / 100)
  )
}
