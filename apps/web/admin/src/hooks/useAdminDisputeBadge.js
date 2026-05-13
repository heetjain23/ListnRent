import React from 'react'
import { getAdminDisputeMetrics } from '../services/adminDisputesService'
import { useAdminSocketContext } from '../context/AdminSocketContext'

const DISPUTE_EVENTS = [
  'dispute:created',
  'dispute:new_message',
  'dispute:status_changed',
  'dispute:resolved_pending',
  'dispute:closed',
  'dispute:reopened',
  'dispute:assigned',
  'dispute:unread_update',
]

export const useAdminDisputeBadge = ({ enabled = true } = {}) => {
  const { socketRef, connectCount } = useAdminSocketContext()
  const [metrics, setMetrics] = React.useState(null)

  const loadMetrics = React.useCallback(async () => {
    if (!enabled) return
    try {
      const response = await getAdminDisputeMetrics()
      setMetrics(response?.data || response || null)
    } catch {
      // Non-blocking for sidebar UX
    }
  }, [enabled])

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      loadMetrics()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadMetrics])

  React.useEffect(() => {
    if (!enabled) return undefined

    const socket = socketRef.current
    if (!socket) return undefined

    let timer = null
    const schedule = () => {
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        loadMetrics()
      }, 220)
    }

    DISPUTE_EVENTS.forEach((eventName) => socket.on(eventName, schedule))

    return () => {
      if (timer) window.clearTimeout(timer)
      DISPUTE_EVENTS.forEach((eventName) => socket.off(eventName, schedule))
    }
  }, [connectCount, enabled, loadMetrics, socketRef])

  return {
    metrics,
    unreadStaffTotal: metrics?.unreadStaffTotal || 0,
    activeCount: metrics?.activeCount || 0,
    pendingCount: metrics?.pendingCount || 0,
  }
}
