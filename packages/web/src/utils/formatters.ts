export const formatPrice = (value: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value)

export const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(typeof value === 'string' ? new Date(value) : value)
