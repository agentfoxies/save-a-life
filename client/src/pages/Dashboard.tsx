import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { HiChatBubbleLeftRight, HiMagnifyingGlass, HiTrash, HiBell, HiBellAlert } from 'react-icons/hi2'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'
import { conversationService } from '../services/api'
import api from '../services/api'

interface Conversation {
  roomId: string
  displayName: string
  anonymous: boolean
  status: 'active' | 'closed'
  createdAt: string
  updatedAt: string
}

interface Stats {
  totalConversations: number
  activeConversations: number
  closedConversations: number
}

const Dashboard = () => {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [stats, setStats] = useState<Stats>({ totalConversations: 0, activeConversations: 0, closedConversations: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [newMessageAlert, setNewMessageAlert] = useState<{roomId: string, senderName: string} | null>(null)

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported in this browser')
      return
    }
    
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      setNotificationsEnabled(true)
      toast.success('Notifications enabled! You\'ll be alerted when new messages arrive.')
    } else {
      toast.error('Notification permission denied')
    }
  }

  // Listen for new messages via socket
  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001'
    const socket = io(SOCKET_URL)

    socket.on('new_support_message', (data: { roomId: string; senderName: string; content: string; suicideRisk: boolean }) => {
      // Show browser notification
      if (notificationsEnabled && Notification.permission === 'granted') {
        const notification = new Notification('New message from ' + data.senderName, {
          body: data.content,
          icon: '/heart.svg',
          tag: data.roomId,
          requireInteraction: true
        })
        
        notification.onclick = () => {
          window.focus()
          navigate(`/support/${data.roomId}`)
        }
      }

      // Show in-app alert
      setNewMessageAlert(data)
      setTimeout(() => setNewMessageAlert(null), 5000)
      
      // Refresh conversation list
      loadData()
    })

    socket.on('new_visitor', (data: { roomId: string; displayName: string }) => {
      if (notificationsEnabled && Notification.permission === 'granted') {
        new Notification('New visitor joined!', {
          body: `${data.displayName} is waiting for support`,
          icon: '/heart.svg',
          requireInteraction: true
        })
      }
      loadData()
    })

    return () => { socket.close() }
  }, [notificationsEnabled])

  const loadData = async () => {
    try {
      const [convResponse, statsResponse] = await Promise.all([
        conversationService.getAll('active'),
        conversationService.getStats(),
      ])
      setConversations(Array.isArray(convResponse.data) ? convResponse.data : [])
      setStats(statsResponse.data || { totalConversations: 0, activeConversations: 0, closedConversations: 0 })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleDelete = async (roomId: string) => {
    try {
      await api.delete(`/conversations/${roomId}`)
      toast.success('Conversation deleted')
      setDeleteConfirm(null)
      loadData()
    } catch (error) { toast.error('Failed to delete') }
  }

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete ALL conversations?')) return
    try {
      await api.delete('/conversations')
      toast.success('All conversations deleted')
      loadData()
    } catch (error) { toast.error('Failed to delete all') }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.roomId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-20 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Support Dashboard</h1>
          <div className="flex items-center space-x-3">
            {!notificationsEnabled && (
              <button onClick={requestNotificationPermission}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 flex items-center space-x-2">
                <HiBell className="w-4 h-4" />
                <span>Enable Alerts</span>
              </button>
            )}
            {notificationsEnabled && (
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm flex items-center space-x-2">
                <HiBellAlert className="w-4 h-4" />
                <span>Alerts On</span>
              </span>
            )}
            {conversations.length > 0 && (
              <button onClick={handleDeleteAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center space-x-2">
                <HiTrash className="w-4 h-4" /><span>Delete All</span>
              </button>
            )}
          </div>
        </div>

        {/* New Message Alert */}
        {newMessageAlert && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <HiBellAlert className="w-6 h-6 text-blue-600 animate-bounce" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">New message from {newMessageAlert.senderName}!</p>
                <p className="text-sm text-blue-600 dark:text-blue-300">Click to respond</p>
              </div>
            </div>
            <button onClick={() => navigate(`/support/${newMessageAlert.roomId}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              Reply Now
            </button>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6"><p className="text-sm text-gray-500 mb-1">Total Chats</p><p className="text-3xl font-bold">{stats.totalConversations || 0}</p></div>
          <div className="glass-card rounded-2xl p-6"><p className="text-sm text-gray-500 mb-1">Active Now</p><p className="text-3xl font-bold text-green-600">{stats.activeConversations || 0}</p></div>
          <div className="glass-card rounded-2xl p-6"><p className="text-sm text-gray-500 mb-1">Closed</p><p className="text-3xl font-bold text-gray-400">{stats.closedConversations || 0}</p></div>
        </div>

        <div className="relative mb-6">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations..." className="pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl w-full" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <HiChatBubbleLeftRight className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No active conversations</p>
            <p className="text-sm mt-2">When someone joins, they'll appear here and you'll get a notification</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conv) => (
              <motion.div key={conv.roomId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{conv.displayName}</h3>
                      {conv.anonymous && <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">Anonymous</span>}
                    </div>
                    <div className="text-sm text-gray-500">Room: {conv.roomId?.substring(0, 8)}... • Joined: {format(new Date(conv.createdAt), 'h:mm a')}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => navigate(`/support/${conv.roomId}`)}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Reply</button>
                    {deleteConfirm === conv.roomId ? (
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleDelete(conv.roomId)} className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs">Confirm</button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-3 py-2 bg-gray-200 rounded-lg text-xs">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(conv.roomId)} className="p-2 text-gray-400 hover:text-red-500">
                        <HiTrash className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default Dashboard
