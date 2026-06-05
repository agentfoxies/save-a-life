import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
  _id: string
  roomId: string
  senderType: 'visitor' | 'support'
  senderName: string
  content: string
  imageUrl?: string
  read: boolean
  createdAt: string
  suicideRisk?: boolean
}

interface ChatContextType {
  socket: Socket | null
  messages: Message[]
  isConnected: boolean
  roomId: string | null
  displayName: string | null
  setRoomId: (id: string | null) => void
  setDisplayName: (name: string | null) => void
  addMessage: (message: Message) => void
  clearChat: () => void
  showSuicideModal: boolean
  setShowSuicideModal: (show: boolean) => void
}

const ChatContext = createContext<ChatContextType>({
  socket: null, messages: [], isConnected: false, roomId: null, displayName: null,
  setRoomId: () => {}, setDisplayName: () => {}, addMessage: () => {}, clearChat: () => {},
  showSuicideModal: false, setShowSuicideModal: () => {},
})

export const useChat = () => useContext(ChatContext)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [showSuicideModal, setShowSuicideModal] = useState(false)

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001'
    
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })

    newSocket.on('connect', () => setIsConnected(true))
    newSocket.on('disconnect', () => setIsConnected(false))

    newSocket.on('receive_message', (message: Message) => {
      setMessages(prev => [...prev, message])
      if (message.suicideRisk) setShowSuicideModal(true)
    })

    newSocket.on('message_deleted', (data: { messageId: string }) => {
      setMessages(prev => prev.filter(msg => msg._id !== data.messageId))
    })

    setSocket(newSocket)
    return () => { newSocket.close() }
  }, [])

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message])
  }, [])

  const clearChat = useCallback(() => {
    setMessages([])
    setRoomId(null)
    setDisplayName(null)
    localStorage.removeItem('roomId')
    localStorage.removeItem('displayName')
  }, [])

  return (
    <ChatContext.Provider value={{
      socket, messages, isConnected, roomId, displayName,
      setRoomId, setDisplayName, addMessage, clearChat,
      showSuicideModal, setShowSuicideModal,
    }}>
      {children}
    </ChatContext.Provider>
  )
}
