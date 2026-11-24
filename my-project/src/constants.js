




export const STATUS = {
  PENDING: {
    label: 'Pending',
    dot: 'bg-pending-dot',
    badge: 'bg-pending-bg text-pending-text',
    stat: 'text-pending-text',
  },
  IN_PROGRESS: {
    label: 'In progress',
    dot: 'bg-progress-dot',
    badge: 'bg-progress-bg text-progress-text',
    stat: 'text-progress-text',
  },
  COMPLETED: {
    label: 'Completed',
    dot: 'bg-done-dot',
    badge: 'bg-done-bg text-done-text',
    stat: 'text-done-text',
  },
}



export const STATUS_KEYS = Object.keys(STATUS)
export const DEFAULT_STATUS = 'PENDING'





export const normalizeStatus = (value) => {
  const key = String(value ?? '').trim().toUpperCase().replace(/[\s-]+/g, '_')
  if (STATUS[key]) return key
  console.warn('Unknown task status from API:', value)
  return DEFAULT_STATUS
}

export const PRIORITIES = ['Low', 'Medium', 'High']