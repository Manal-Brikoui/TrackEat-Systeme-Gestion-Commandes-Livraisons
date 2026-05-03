import { useEffect, useRef } from 'react'
import { websocketService } from '../services/websocketService'
import { useAuth } from './useAuth'

export function useWebSocket(key, onMessage) {
  const { user, isAuthenticated } = useAuth()
  const onMessageRef = useRef(onMessage)
  useEffect(() => { onMessageRef.current = onMessage })

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return
    websocketService.connect(user.id)
    websocketService.subscribe(key, (data) => onMessageRef.current(data))
    return () => websocketService.unsubscribe(key)
  }, [isAuthenticated, user?.id, key])
}

export function useOrderTracking(orderId, onLocation) {
  const { user, isAuthenticated } = useAuth()
  const onLocationRef = useRef(onLocation)
  useEffect(() => { onLocationRef.current = onLocation })

  const key = `tracking-${orderId}`

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !orderId) return
    websocketService.connect(user.id)
    websocketService.subscribeToOrder(orderId, key, (data) => onLocationRef.current(data))
    return () => websocketService.unsubscribeFromOrder(orderId, key)
  }, [isAuthenticated, user?.id, orderId, key])
}