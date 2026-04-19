// Formater un prix
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-CD', {
    style: 'currency',
    currency: 'CDF',
  }).format(price)
}

// Formater une date
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-CD')
}

// Vérifier si un email est valide
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}