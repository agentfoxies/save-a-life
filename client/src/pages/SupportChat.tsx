import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiPaperAirplane, HiArrowLeft, HiExclamationTriangle } from "react-icons/hi2"
import StaffNotes from "../components/StaffNotes" 'react-icons/hi2'
import { io, Socket } from 'socket.io-client'
import ChatMessage from '../components/ChatMessage'
import SuicideRiskModal from '../components/SuicideRiskModal'
import toast from 'react-hot-toast'
import { messageService } from '../services/api'

interface Message {
  _id: string; roomId: string; senderType: 'visitor' | 'support'; senderName: string
  content: string; imageUrl?: string; read: boolean; createdAt: string; suicideRisk?: boolean
}

const SupportChat = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showSuicideModal, setShowSuicideModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const supportName = 'Support Team'

  const scrollToBottom = useCallback(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [])
  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  useEffect(() => {
    if (!roomId) return
    const SOCKET_URL = 'https://save-a-life-api.onrender.com'
    const newSocket = io(SOCKET_URL)
    setSocket(newSocket)
    newSocket.on('connect', () => newSocket.emit('join_room', { roomId, senderType: 'support', displayName: supportName }))

    const loadMessages = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
        const response = await fetch(`${API_URL}/messages/${roomId}`)
        const data = await response.json()
        setMessages(data.messages || [])
      } catch (error) { console.error('Error loading messages:', error) }
      finally { setIsLoading(false) }
    }
    loadMessages()

    newSocket.on('receive_message', (message: Message) => { setMessages(prev => [...prev, message]); if (message.suicideRisk) setShowSuicideModal(true) })
    newSocket.on('user_typing', (data: { displayName: string }) => { setTypingUser(data.displayName); setIsTyping(true) })
    newSocket.on('user_stop_typing', () => { setIsTyping(false); setTypingUser('') })

    return () => { newSocket.emit('stop_typing', { roomId }); newSocket.close() }
  }, [roomId])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket || !roomId) return
    socket.emit('send_message', { roomId, content: newMessage.trim(), senderType: 'support', senderName: supportName })
    setNewMessage('')
    socket.emit('stop_typing', { roomId })
  }

  const handleTyping = () => {
    if (!socket || !roomId) return
    socket.emit('typing', { roomId, displayName: supportName })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => socket.emit('stop_typing', { roomId }), 1000)
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!socket || !roomId) return
    try {
      await messageService.deleteMessage(messageId)
      socket.emit('delete_message', { roomId, messageId })
      setMessages(prev => prev.filter(msg => msg._id !== messageId))
      toast.success('Message deleted')
    } catch (error) { toast.error('Failed to delete message') }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-screen flex flex-col pt-16">
      <div className="glass-card border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-gray-100"><HiArrowLeft className="w-5 h-5" /></button>
            <div><h2 className="font-semibold">Support Chat</h2><p className="text-xs text-gray-500">Room: {roomId?.substring(0, 8)}...</p></div>
          </div>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">Support Team</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {isLoading ? <div className="flex justify-center h-full items-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div> :
         messages.length === 0 ? <div className="flex items-center justify-center h-full"><div className="text-center"><HiExclamationTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Waiting for messages...</p></div></div> :
         <AnimatePresence>{messages.map((message) => <ChatMessage key={message._id} {...message} onDelete={handleDeleteMessage} />)}</AnimatePresence>}
        {isTyping && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center space-x-2 text-sm text-gray-500"><div className="flex space-x-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" /><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></div><span>{typingUser} is typing...</span></motion.div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <textarea value={newMessage} onChange={(e) => { setNewMessage(e.target.value); handleTyping() }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e) } }} placeholder="Type your reply..." rows={1} className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" style={{ maxHeight: '120px' }} />
          <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={!newMessage.trim()} className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-full text-white"><HiPaperAirplane className="w-5 h-5 transform rotate-90" /></motion.button>
        </form>
      </div>
      <SuicideRiskModal isOpen={showSuicideModal} onClose={() => setShowSuicideModal(false)} />
    </motion.div>
  )
}
export default SupportChat
