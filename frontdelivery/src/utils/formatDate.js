export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' }) : ''

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : ''

export const timeAgo = (d) => {
  if (!d) return ''
  const m = Math.floor((Date.now() - new Date(d)) / 60000)
  if (m < 1) return "A l'instant"
  if (m < 60) return `Il y a ${m} min`
  if (m < 1440) return `Il y a ${Math.floor(m / 60)}h`
  return formatDate(d)
}