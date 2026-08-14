import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { JudgeResultMessage } from '../types'

interface UseWebSocketOptions {
  submissionId?: string
  studentId?: string
  onResult?: (result: JudgeResultMessage) => void
}

const WS_URL = import.meta.env.VITE_WS_URL || '/ws'

export function useWebSocket({ submissionId, studentId, onResult }: UseWebSocketOptions) {
  const clientRef = useRef<Client | null>(null)
  // BUG FIX: dùng ref để lưu subscriptions, không reset khi re-render
  const subscriptionsRef = useRef<ReturnType<Client['subscribe']>[]>([])
  // BUG FIX: lưu onResult vào ref để tránh re-create connect() mỗi lần render
  const onResultRef = useRef(onResult)
  useEffect(() => { onResultRef.current = onResult }, [onResult])

  const connect = useCallback(() => {
    // BUG FIX: hủy client cũ trước khi tạo mới
    if (clientRef.current?.active) {
      clientRef.current.deactivate()
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('[WebSocket] Connected')
        // BUG FIX: clear subscriptions cũ trước khi subscribe mới
        subscriptionsRef.current = []

        // Subscribe theo submissionId nếu đang chờ kết quả
        if (submissionId) {
          const sub = client.subscribe(
            `/topic/submission/${submissionId}`,
            (message) => {
              try {
                const result: JudgeResultMessage = JSON.parse(message.body)
                onResultRef.current?.(result)
              } catch (e) {
                console.error('[WebSocket] Failed to parse message:', e)
              }
            }
          )
          subscriptionsRef.current.push(sub)
        }

        // Subscribe theo studentId để nhận mọi thông báo
        if (studentId) {
          const sub = client.subscribe(
            `/queue/student/${studentId}`,
            (message) => {
              try {
                const result: JudgeResultMessage = JSON.parse(message.body)
                onResultRef.current?.(result)
              } catch (e) {
                console.error('[WebSocket] Failed to parse message:', e)
              }
            }
          )
          subscriptionsRef.current.push(sub)
        }
      },
      onDisconnect: () => {
        console.log('[WebSocket] Disconnected')
      },
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error:', frame)
      },
    })

    client.activate()
    clientRef.current = client
  // BUG FIX: bỏ onResult khỏi deps — đã dùng ref để tránh infinite loop
  }, [submissionId, studentId])

  useEffect(() => {
    connect()
    return () => {
      subscriptionsRef.current.forEach(sub => {
        try { sub.unsubscribe() } catch {}
      })
      clientRef.current?.deactivate()
    }
  }, [connect])

  return { client: clientRef.current }
}
