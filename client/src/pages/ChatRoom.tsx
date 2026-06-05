import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiPaperAirplane, HiArrowLeft, HiExclamationTriangle, HiPhoto } from 'react-icons/hi2'
import { useChat } from '../context/ChatContext'
import { messageService } from '../services/api'
import ChatMessage from '../components/ChatMessage'
import SuicideRiskModal from '../components/SuicideRiskModal'
import toast from 'react-hot-toast'

const ChatRoom = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { socket, messages, displayName, showSuicideModal, setShowSuicideModal, addMessage } = useChat()
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  useEffect(() => {
    if (!socket || !roomId || !displayName) return
    socket.emit('join_room', { roomId, senderType: 'visitor', displayName })

    const loadMessages = async () => {
      try {
        const response = await messageService.getMessages(roomId)
        if (response.data.messages) {
          response.data.messages.forEach((msg: any) => addMessage(msg))
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadMessages()

    socket.on('user_typing', (data: { displayName: string }) => {
      setTypingUser(data.displayName)
      setIsTyping(true)
    })
    socket.on('user_stop_typing', () => {
      setIsTyping(false)
      setTypingUser('')
    })

    return () => {
      socket.emit('stop_typing', { roomId })
      socket.off('user_typing')
      socket.off('user_stop_typing')
    }
  }, [socket, roomId, displayName])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket || !roomId || !displayName) return
    socket.emit('send_message', { roomId, content: newMessage.trim(), senderType: 'visitor', senderName: displayName })
    setNewMessage('')
    socket.emit('stop_typing', { roomId })
  }

  const handleTyping = () => {
    if (!socket || !roomId) return
    socket.emit('typing', { roomId, displayName })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => socket.emit('stop_typing', { roomId }), 1000)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !socket || !roomId || !displayName) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return }
    const formData = new FormData()
    formData.append('image', file)
    try {
      const response = await messageService.uploadImage(formData)
      socket.emit('send_message', { roomId, content: '📷 Image', senderType: 'visitor', senderName: displayName, imageUrl: response.data.imageUrl })
    } catch (error) { toast.error('Failed to upload image') }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!socket || !roomId) return
    try {
      await messageService.deleteMessage(messageId)
      socket.emit('delete_message', { roomId, messageId })
      toast.success('Message deleted')
    } catch (error) { toast.error('Failed to delete message') }
  }

  const handleLeave = () => {
    if (socket) socket.emit('stop_typing', { roomId })
    navigate('/')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-screen flex flex-col pt-16">
      <div className="glass-card border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={handleLeave} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><HiArrowLeft className="w-5 h-5" /></button>
            <div><h2 className="font-semibold text-gray-900 dark:text-white">Support Chat</h2><p className="text-xs text-gray-500">{displayName} • Private Room</p></div>
          </div>
          <div className="flex items-center space-x-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span className="text-xs text-green-600">Connected</span></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {isLoading ? <div className="flex justify-center h-full items-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div> :
         messages.length === 0 ? <div className="flex items-center justify-center h-full"><div className="text-center"><HiExclamationTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No messages yet.</p></div></div> :
         <AnimatePresence>{messages.map((message) => <ChatMessage key={message._id} {...message} onDelete={handleDeleteMessage} />)}</AnimatePresence>}
        {isTyping && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center space-x-2 text-sm text-gray-500"><div className="flex space-x-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" /><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></div><span>{typingUser} is typing...</span></motion.div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><HiPhoto className="w-5 h-5 text-gray-600" /></button>
          <textarea value={newMessage} onChange={(e) => { setNewMessage(e.target.value); handleTyping() }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e) } }} placeholder="Type your message..." rows={1} className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500" style={{ maxHeight: '120px' }} />
          <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={!newMessage.trim()} className="p-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-full text-white"><HiPaperAirplane className="w-5 h-5 transform rotate-90" /></motion.button>
        </form>
      </div>
      <SuicideRiskModal isOpen={showSuicideModal} onClose={() => setShowSuicideModal(false)} />
    </motion.div>
  )
}
export default ChatRoom
