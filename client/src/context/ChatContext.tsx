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
  socket: null,
  messages: [],
  isConnected: false,
  roomId: null,
  displayName: null,
  setRoomId: () => {},
  setDisplayName: () => {},
  addMessage: () => {},
  clearChat: () => {},
  showSuicideModal: false,
  setShowSuicideModal: () => {},
})

export const useChat = () => useContext(ChatContext)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [roomId, setRoomId] = useState<string | null>(() => {
    return localStorage.getItem('roomId')
  })
  const [displayName, setDisplayName] = useState<string | null>(() => {
    return localStorage.getItem('displayName')
  })
  const [showSuicideModal, setShowSuicideModal] = useState(false)

  useEffect(() => {
    if (roomId) {
      localStorage.setItem('roomId', roomId)
    } else {
      localStorage.removeItem('roomId')
    }
  }, [roomId])

  useEffect(() => {
    if (displayName) {
      localStorage.setItem('displayName', displayName)
    } else {
      localStorage.removeItem('displayName')
    }
  }, [displayName])

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
    
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to socket server')
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from socket server')
    })

    newSocket.on('receive_message', (message: Message) => {
      setMessages(prev => [...prev, message])
      if (message.suicideRisk) {
        setShowSuicideModal(true)
      }
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message])
  }, [])

  const clearChat = useCallback(() => {
    setMessages([])
    setRoomId(null)
    setDisplayName(null)
  }, [])

  return (
    <ChatContext.Provider value={{
      socket,
      messages,
      isConnected,
      roomId,
      displayName,
      setRoomId,
      setDisplayName,
      addMessage,
      clearChat,
      showSuicideModal,
      setShowSuicideModal,
    }}>
      {children}
    </ChatContext.Provider>
  )
}