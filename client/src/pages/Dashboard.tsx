import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { HiChatBubbleLeftRight, HiMagnifyingGlass, HiTrash, HiBell, HiBellAlert, HiArchiveBox, HiArrowPath } from 'react-icons/hi2'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'
import { conversationService } from '../services/api'
import api from '../services/api'

interface Conversation {
  roomId: string; displayName: string; anonymous: boolean; status: 'active' | 'closed'; createdAt: string; updatedAt: string
}

interface Stats {
  totalConversations: number; activeConversations: number; closedConversations: number
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
  const [filter, setFilter] = useState<'active' | 'closed'>('active')

  useEffect(() => {
    if ('Notification' in window) setNotificationsEnabled(Notification.permission === 'granted')
  }, [])

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) { toast.error('Browser does not support notifications'); return }
    if (Notification.permission === 'denied') { toast.error('Notifications blocked! Click 🔒 in address bar to allow.'); return }
    if (Notification.permission === 'granted') { setNotificationsEnabled(true); toast.success('Already enabled!'); return }
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') { setNotificationsEnabled(true); toast.success('✅ Notifications enabled!'); new Notification('Working!', { body: 'You will be alerted of new messages.', icon: '/heart.svg' }) }
    } catch (error) { toast.error('Could not request permission.') }
  }

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001'
    const socket = io(SOCKET_URL)
    socket.on('new_support_message', (data: { roomId: string; senderName: string; content: string }) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        try { const n = new Notification(`📩 ${data.senderName}`, { body: data.content.substring(0, 100), icon: '/heart.svg', tag: data.roomId, requireInteraction: true }); n.onclick = () => { window.focus(); navigate(`/support/${data.roomId}`) } } catch (e) {}
      }
      setNewMessageAlert(data); setTimeout(() => setNewMessageAlert(null), 8000); loadData()
    })
    socket.on('new_visitor', () => loadData())
    return () => { socket.close() }
  }, [])

  const loadData = async () => {
    try {
      const [convResponse, statsResponse] = await Promise.all([conversationService.getAll(filter), conversationService.getStats()])
      setConversations(Array.isArray(convResponse.data) ? convResponse.data : [])
      setStats(statsResponse.data || { totalConversations: 0, activeConversations: 0, closedConversations: 0 })
    } catch (error) {} finally { setIsLoading(false) }
  }

  useEffect(() => { loadData(); const interval = setInterval(loadData, 10000); return () => clearInterval(interval) }, [filter])

  const handleStatusChange = async (roomId: string, newStatus: 'active' | 'closed') => {
    try { await conversationService.updateStatus(roomId, newStatus); toast.success(newStatus === 'active' ? 'Reopened' : 'Closed'); loadData() } catch (error) { toast.error('Failed') }
  }

  const handleDelete = async (roomId: string) => {
    try { await api.delete(`/conversations/${roomId}`); toast.success('Deleted'); setDeleteConfirm(null); loadData() } catch (error) { toast.error('Failed') }
  }

  // Delete only current filter conversations
  const handleDeleteAll = async () => {
    const label = filter === 'active' ? 'ALL active' : 'ALL closed'
    if (!window.confirm(`Delete ${label} conversations? This cannot be undone!`)) return
    try {
      // Delete conversations one by one for the current filter
      for (const conv of conversations) {
        await api.delete(`/conversations/${conv.roomId}`)
      }
      toast.success(`All ${filter} conversations deleted`)
      loadData()
    } catch (error) { toast.error('Failed to delete all') }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || conv.roomId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-20 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Support Dashboard</h1>
          <div className="flex items-center space-x-3">
            <button onClick={requestNotificationPermission} className={`px-4 py-2 rounded-lg text-sm flex items-center space-x-2 ${notificationsEnabled ? 'bg-green-100 text-green-700' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}>
              {notificationsEnabled ? <HiBellAlert className="w-4 h-4" /> : <HiBell className="w-4 h-4" />}
              <span>{notificationsEnabled ? 'Alerts ON' : 'Enable Alerts'}</span>
            </button>
            {conversations.length > 0 && (
              <button onClick={handleDeleteAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center space-x-2">
                <HiTrash className="w-4 h-4" /><span>Delete {filter === 'active' ? 'Active' : 'Closed'}</span>
              </button>
            )}
          </div>
        </div>

        {newMessageAlert && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-400 rounded-xl flex items-center justify-between cursor-pointer" onClick={() => navigate(`/support/${newMessageAlert.roomId}`)}>
            <div className="flex items-center space-x-3"><span className="text-2xl">🔔</span><div><p className="font-bold text-blue-800 dark:text-blue-200">New message from {newMessageAlert.senderName}!</p></div></div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Reply Now →</button>
          </motion.div>
        )}

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6"><p className="text-sm text-gray-500">Total Chats</p><p className="text-3xl font-bold">{stats.totalConversations || 0}</p></div>
          <div className="glass-card rounded-2xl p-6"><p className="text-sm text-gray-500">Active</p><p className="text-3xl font-bold text-green-600">{stats.activeConversations || 0}</p></div>
          <div className="glass-card rounded-2xl p-6"><p className="text-sm text-gray-500">Closed</p><p className="text-3xl font-bold text-gray-400">{stats.closedConversations || 0}</p></div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <button onClick={() => setFilter('active')} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>🟢 Active</button>
          <button onClick={() => setFilter('closed')} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'closed' ? 'bg-gray-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>📁 Closed</button>
        </div>

        <div className="relative mb-6">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl w-full" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12 text-gray-500"><HiChatBubbleLeftRight className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p className="text-lg">No {filter} conversations</p></div>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conv) => (
              <motion.div key={conv.roomId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      {conv.status === 'active' && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                      <h3 className="text-lg font-semibold">{conv.displayName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${conv.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{conv.status}</span>
                      {conv.anonymous && <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">Anon</span>}
                    </div>
                    <div className="text-sm text-gray-500">Room: {conv.roomId?.substring(0, 8)}... • {format(new Date(conv.createdAt), 'MMM d, h:mm a')}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {conv.status === 'active' ? (
                      <>
                        <button onClick={() => navigate(`/support/${conv.roomId}`)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Reply</button>
                        <button onClick={() => handleStatusChange(conv.roomId, 'closed')} className="p-2 text-gray-400 hover:text-yellow-500" title="Close chat"><HiArchiveBox className="w-5 h-5" /></button>
                      </>
                    ) : (
                      <button onClick={() => handleStatusChange(conv.roomId, 'active')} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 flex items-center space-x-1"><HiArrowPath className="w-4 h-4" /><span>Reopen</span></button>
                    )}
                    {deleteConfirm === conv.roomId ? (
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleDelete(conv.roomId)} className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs">Confirm</button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-3 py-2 bg-gray-200 rounded-lg text-xs">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(conv.roomId)} className="p-2 text-gray-400 hover:text-red-500"><HiTrash className="w-5 h-5" /></button>
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
