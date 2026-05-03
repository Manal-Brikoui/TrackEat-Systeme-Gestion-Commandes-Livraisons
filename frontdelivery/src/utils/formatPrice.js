export const formatPrice = (v) =>
  v == null
    ? '—'
    : new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 2 }).format(v)