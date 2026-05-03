import { ORDER_STATUS_LABELS } from '../../utils/constants'

const cfg = {
  PENDING:   'badge-warning',
  ACCEPTED:  'badge-info',
  REJECTED:  'badge-danger',
  PREPARING: 'badge-warning',
  READY:     'badge-accent',
  PICKED_UP: 'badge-info',
  DELIVERED: 'badge-success',
  CANCELLED: 'badge-danger',
  APPROVED:  'badge-success',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${cfg[status] || 'badge-neutral'}`}>
      {ORDER_STATUS_LABELS[status] || status}
    </span>
  )
}