import { formatWithThousandSeparator } from '@/lib/utils'

export const getFullDateInIndonesia = (date: Date) => {
  const options = {
    weekday: 'long', // Full name of the day (e.g., "Selasa")
    day: 'numeric', // Day of the month (e.g., "10")
    month: 'long', // Full name of the month (e.g., "Januari")
    year: 'numeric', // Full year (e.g., "2022")
    hour: '2-digit', // Hour (e.g., "44")
    minute: '2-digit', // Minute (e.g., "55")
    hour12: false // Use 24-hour format
  }

  // @ts-ignore
  const formatter = new Intl.DateTimeFormat('id-ID', options)
  let formattedDate = formatter.format(date)

  const time = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  formattedDate = formattedDate.replace(/\d{2}:\d{2}/, time)
  return formattedDate
}

export const getMonthShortName = (month: number): string =>
  new Date(0, month).toLocaleString('id-ID', { month: 'short' })

export const getTotalAfterTax = (subtotal: number, tax = 0, discount = 0) => {
  return formatWithThousandSeparator(
    subtotal * (1 - (discount || 0) / 100) * (1 + (tax || 0) / 100)
  )
}

export function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}
