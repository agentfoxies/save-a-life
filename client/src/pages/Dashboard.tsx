import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { HiChatBubbleLeftRight, HiMagnifyingGlass, HiTrash, HiBell, HiBellAlert, HiArchiveBox, HiArrowPath, HiSparkles, HiChartBar } from 'react-icons/hi2'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'
import axios from 'axios'
import { conversationService } from '../services/api'
import api from '../services/api'
import StaffStatus from '../components/StaffStatus'
import StaffActivity from '../components/StaffActivity'

const API_URL = 'https://save-a-life-api.onrender.com/api'

interface Conversation { roomId: string; displayName: string; anonymous: boolean; status: 'active' | 'closed'; createdAt: string; updatedAt: string; mood?: string }
interface Stats { totalConversations: number; activeConversations: number; closedConversations: number }

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
    const sendHeartbeat = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        if (token) await axios.patch(`${API_URL}/auth/status`, { status: 'online' }, { headers: { Authorization: `Bearer ${token}` } })
      } catch {}
    }
    sendHeartbeat(); const i = setInterval(sendHeartbeat, 15000); return () => clearInterval(i)
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        if (!token) { navigate('/admin/login'); return }
        await api.get('/auth/verify', { headers: { Authorization: `Bearer ${token}` } })
      } catch { localStorage.clear(); navigate('/admin/login') }
    }
    checkAuth(); const i = setInterval(checkAuth, 5000); return () => clearInterval(i)
  }, [])

  useEffect(() => { if ('Notification' in window) setNotificationsEnabled(Notification.permission === 'granted') }, [])

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) { toast.error('Not supported'); return }
    if (Notification.permission === 'denied') { toast.error('Blocked'); return }
    if (Notification.permission === 'granted') { setNotificationsEnabled(true); return }
    try {
      const p = await Notification.requestPermission()
      if (p === 'granted') { setNotificationsEnabled(true); new Notification('Ready!', { body: 'Alerts active' }) }
    } catch {}
  }

  useEffect(() => {
    const s = io('https://save-a-life-api.onrender.com')
    s.on('new_support_message', (d: any) => {
      if (Notification.permission === 'granted') {
        try { const n = new Notification(`📩 ${d.senderName}`, { body: d.content?.substring(0, 100), icon: '/favicon-new.png', tag: d.roomId }); n.onclick = () => { window.focus(); navigate(`/support/${d.roomId}`) } } catch {}
      }
      setNewMessageAlert(d); setTimeout(() => setNewMessageAlert(null), 8000); loadData()
    })
    s.on('new_visitor', () => loadData())
    return () => { s.close() }
  }, [])

  const loadData = async () => {
    try {
      const [c, st] = await Promise.all([conversationService.getAll(filter), conversationService.getStats()])
      setConversations(Array.isArray(c.data) ? c.data : [])
      setStats(st.data || { totalConversations: 0, activeConversations: 0, closedConversations: 0 })
    } catch {} finally { setIsLoading(false) }
  }

  useEffect(() => { loadData(); const i = setInterval(loadData, 10000); return () => clearInterval(i) }, [filter])

  const handleStatusChange = async (roomId: string, s: 'active' | 'closed') => {
    try { await conversationService.updateStatus(roomId, s); toast.success(s === 'active' ? 'Reopened' : 'Closed'); loadData() } catch { toast.error('Failed') }
  }
  const handleDelete = async (roomId: string) => {
    try { await api.delete(`/conversations/${roomId}`); toast.success('Deleted'); setDeleteConfirm(null); loadData() } catch { toast.error('Failed') }
  }
  const handleDeleteAll = async () => {
    if (!window.confirm(`Delete ALL ${filter}?`)) return
    try { for (const c of conversations) await api.delete(`/conversations/${c.roomId}`); toast.success('Done'); loadData() } catch { toast.error('Failed') }
  }

  const getMoodEmoji = (mood?: string) => {
    switch (mood) { case 'Good': return '😄'; case 'Okay': return '🙂'; case 'Neutral': return '😐'; case 'Sad': return '😔'; case 'Struggling': return '😢'; default: return ''; }
  }

  const filtered = conversations.filter(c => c.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || c.roomId?.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="min-h-screen hero-gradient pt-20 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-primary-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
              Support Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Real-time overview of all conversations</p>
          </div>
          <div className="flex items-center space-x-3">
            <StaffStatus />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={requestNotificationPermission}
              className={`px-5 py-3 rounded-2xl text-sm font-semibold flex items-center space-x-2 transition-all ${
                notificationsEnabled ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30'
              }`}>
              {notificationsEnabled ? <HiBellAlert className="w-5 h-5" /> : <HiBell className="w-5 h-5" />}
              <span>{notificationsEnabled ? 'Alerts ON' : 'Enable Alerts'}</span>
            </motion.button>
          </div>
        </motion.div>

        <StaffActivity />

        {/* New Message Alert */}
        {newMessageAlert && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl shadow-2xl flex items-center justify-between cursor-pointer animate-glow"
            onClick={() => navigate(`/support/${newMessageAlert.roomId}`)}>
            <div className="flex items-center space-x-3">
              <span className="text-3xl animate-bounce">🔔</span>
              <div>
                <p className="font-bold text-lg">New message from {newMessageAlert.senderName}!</p>
                <p className="text-blue-100 text-sm">Click to respond immediately</p>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm">Reply Now →</motion.button>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Chats', value: stats.totalConversations || 0, icon: HiChartBar, gradient: 'from-blue-500 to-cyan-500', emoji: '💬' },
            { label: 'Active Now', value: stats.activeConversations || 0, icon: HiSparkles, gradient: 'from-green-500 to-teal-500', emoji: '🟢' },
            { label: 'Closed', value: stats.closedConversations || 0, icon: HiArchiveBox, gradient: 'from-gray-500 to-slate-500', emoji: '📁' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-stat rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                  <p className="text-4xl font-black mt-1">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                  {stat.emoji}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 mb-6">
          {['active', 'closed'].map((f) => (
            <motion.button key={f} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f as 'active' | 'closed')}
              className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
                filter === f ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-xl' : 'glass-card hover:shadow-lg'
              }`}>
              {f === 'active' ? '🟢 Active Chats' : '📁 Closed Chats'}
            </motion.button>
          ))}
          {conversations.length > 0 && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleDeleteAll}
              className="ml-auto px-5 py-3 bg-red-500 text-white rounded-2xl text-sm font-bold hover:bg-red-600 shadow-lg flex items-center space-x-2">
              <HiTrash className="w-4 h-4" /><span>Clear All</span>
            </motion.button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search conversations..." 
            className="w-full pl-12 pr-4 py-4 glass-card text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
        </div>

        {/* Conversations */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <HiChatBubbleLeftRight className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-xl font-semibold text-gray-500">No {filter} conversations</p>
            <p className="text-gray-400 mt-1">New chats will appear here in real-time</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filtered.map((c, i) => (
              <motion.div key={c.roomId} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card glass-card-hover rounded-2xl p-6 animate-border-glow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold ${
                      c.status === 'active' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-gray-400 text-white'
                    }`}>
                      {c.displayName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold">{c.displayName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          c.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-600'
                        }`}>{c.status}</span>
                        {c.anonymous && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">Anon</span>}
                        {c.mood && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">{getMoodEmoji(c.mood)} {c.mood}</span>}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Room {c.roomId?.substring(0, 8)}... • {format(new Date(c.createdAt), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {c.status === 'active' ? (
                      <>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/support/${c.roomId}`)}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-sm font-bold shadow-lg hover:shadow-xl">
                          Reply
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => handleStatusChange(c.roomId, 'closed')}
                          className="p-3 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-xl transition-all">
                          <HiArchiveBox className="w-5 h-5" />
                        </motion.button>
                      </>
                    ) : (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleStatusChange(c.roomId, 'active')}
                        className="px-5 py-3 bg-green-100 text-green-700 rounded-2xl text-sm font-bold hover:bg-green-200 flex items-center space-x-2">
                        <HiArrowPath className="w-4 h-4" /><span>Reopen</span>
                      </motion.button>
                    )}
                    {deleteConfirm === c.roomId ? (
                      <div className="flex space-x-2">
                        <button onClick={() => handleDelete(c.roomId)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold">Confirm</button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-gray-200 rounded-xl text-xs">Cancel</button>
                      </div>
                    ) : (
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setDeleteConfirm(c.roomId)}
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                        <HiTrash className="w-5 h-5" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
export default Dashboard
