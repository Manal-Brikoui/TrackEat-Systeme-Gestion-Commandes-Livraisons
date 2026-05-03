import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:9093'

let client = null
const listeners = {}
const topicCallbacks = {}
const _stompSubs = {}
let pendingMessages = []

export const websocketService = {
  connect(userId) {
    if (client?.active) return

    const token = localStorage.getItem('token')

    client = new Client({
      webSocketFactory: () => new SockJS(`${BACKEND}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 4000,
      onConnect: () => {
        console.log('[WS] connecté')
        _stompSubscribe(`/user/${userId}/queue/notifications`, 'notifications')
        _stompSubscribe(`/topic/notifications`, 'notifications')
        // Re-souscrire aux topics en attente
        Object.keys(topicCallbacks).forEach(topic => {
          if (topicCallbacks[topic]?.size > 0) _stompSubscribe(topic, topic)
        })
        pendingMessages.forEach(msg => {
          try { client.publish({ destination: msg.destination, body: JSON.stringify(msg.data) }) }
          catch (e) { console.error('[WS] failed to send pending message:', e) }
        })
        pendingMessages = []
      },
      onStompError: frame => console.error('[WS] STOMP error:', frame.headers?.message || frame),
      onDisconnect: () => {
        console.log('[WS] déconnecté')
        Object.keys(_stompSubs).forEach(k => delete _stompSubs[k])
      }
    })

    client.activate()
  },

  disconnect() {
    client?.deactivate()
    client = null
    Object.keys(_stompSubs).forEach(k => delete _stompSubs[k])
    pendingMessages = []
  },

  subscribe(key, fn) { listeners[key] = fn },
  unsubscribe(key) { delete listeners[key] },

  subscribeToOrder(orderId, key, fn) {
    const topic = `/topic/order/${orderId}`  
    if (!topicCallbacks[topic]) topicCallbacks[topic] = new Map()
    topicCallbacks[topic].set(key, fn)
    if (client?.connected) _stompSubscribe(topic, topic)
  },

  unsubscribeFromOrder(orderId, key) {
    const topic = `/topic/order/${orderId}`  
    topicCallbacks[topic]?.delete(key)
    if (topicCallbacks[topic]?.size === 0) {
      _stompSubs[topic]?.unsubscribe()
      delete _stompSubs[topic]
      delete topicCallbacks[topic]
    }
  },

  send(destination, data) {
    if (!client?.connected) { pendingMessages.push({ destination, data }); return }
    try { client.publish({ destination, body: JSON.stringify(data) }) }
    catch (e) { console.error('[WS] failed to send message:', e) }
  },
}

function _dispatch(topic, msg) {
  try {
    const data = JSON.parse(msg.body)
    if (topic === 'notifications') Object.values(listeners).forEach(fn => fn(data))
    else topicCallbacks[topic]?.forEach(fn => fn(data))
  } catch (e) { console.error('[WS] parse error:', e) }
}

function _stompSubscribe(topic, dispatchKey) {
  if (!client?.connected || _stompSubs[topic]) return
  _stompSubs[topic] = client.subscribe(topic, msg => _dispatch(dispatchKey, msg))
}