import { CalendarDate } from '@internationalized/date'
import { clsx, type ClassValue } from 'clsx'
import { DateValue } from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWithThousandSeparator(num: number): string {
  return num.toLocaleString('en-US')
}

export const getFirstDateOfMonth = (date: DateValue) => {
  return new CalendarDate(date.year, date.month, 1)
}

export const getLastDateOfMonth = (date: DateValue) => {
  if (date.month === 12) {
    return new CalendarDate(date.year + 1, 1, 1).subtract({ days: 1 })
  }
  return new CalendarDate(date.year, date.month + 1, 1).subtract({ days: 1 })
}

export const generateInvoceKode = (sequence: number) => {
  const year = new Date().getFullYear().toString().slice(-2)
  const namaToko = 'RJM'

  return `${namaToko}-${year}${String(sequence).padStart(5, '0')}`
}
