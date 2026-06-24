import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { HiMagnifyingGlass, HiTrash, HiBell, HiBellAlert, HiArchiveBox, HiArrowPath, HiGlobeAlt } from 'react-icons/hi2'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'
import axios from 'axios'
import { conversationService } from '../services/api'
import api from '../services/api'
import StaffStatus from '../components/StaffStatus'

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
    const updateStatus = async (status: string) => {
      try {
        const token = localStorage.getItem('adminToken')
        if (token) await axios.patch(`${API_URL}/auth/status`, { status }, { headers: { Authorization: `Bearer ${token}` } })
      } catch {}
    }
    updateStatus('online')
    const heartbeat = setInterval(() => updateStatus('online'), 15000)
    const handleVisibility = () => updateStatus(document.hidden ? 'away' : 'online')
    document.addEventListener('visibilitychange', handleVisibility)
    return () => { clearInterval(heartbeat); document.removeEventListener('visibilitychange', handleVisibility) }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try { const token = localStorage.getItem('adminToken'); if (!token) { navigate('/admin/login'); return }; await api.get('/auth/verify', { headers: { Authorization: `Bearer ${token}` } }) } catch { localStorage.clear(); navigate('/admin/login') }
    }; checkAuth(); const i = setInterval(checkAuth, 5000); return () => clearInterval(i)
  }, [])

  useEffect(() => { if ('Notification' in window) setNotificationsEnabled(Notification.permission === 'granted') }, [])

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) { toast.error('Not supported'); return }
    if (Notification.permission === 'denied') { toast.error('Blocked'); return }
    if (Notification.permission === 'granted') { setNotificationsEnabled(true); return }
    try { const p = await Notification.requestPermission(); if (p === 'granted') { setNotificationsEnabled(true) } } catch {}
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
    try { const [c, st] = await Promise.all([conversationService.getAll(filter), conversationService.getStats()]); setConversations(Array.isArray(c.data) ? c.data : []); setStats(st.data || { totalConversations: 0, activeConversations: 0, closedConversations: 0 }) } catch {} finally { setIsLoading(false) }
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
    <div className="min-h-screen hero-gradient grid-bg pt-20 px-4">
      <div className="container mx-auto">
        {/* Futuristic Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-6xl font-black tracking-tighter">
              <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent neon-text">
                // DASHBOARD
              </span>
            </h1>
            <p className="text-gray-500 mt-2 font-mono text-sm tracking-wide">SYS.ONLINE • NODE.ACTIVE • {new Date().toLocaleTimeString()}</p>
          </div>
          <div className="flex items-center space-x-4">
            <StaffStatus />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={requestNotificationPermission}
              className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all border ${
                notificationsEnabled ? 'bg-green-500/20 border-green-500/50 text-green-400 neon-glow' : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
              }`}>
              {notificationsEnabled ? <HiBellAlert className="w-5 h-5" /> : <HiBell className="w-5 h-5" />}
              <span>{notificationsEnabled ? 'ALERTS ONLINE' : 'ENABLE ALERTS'}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Alert */}
        {newMessageAlert && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 bg-gradient-to-r from-purple-900/80 via-blue-900/80 to-cyan-900/80 border border-purple-500/50 rounded-2xl flex items-center justify-between cursor-pointer animate-neon-pulse"
            onClick={() => navigate(`/support/${newMessageAlert.roomId}`)}>
            <div className="flex items-center space-x-4">
              <span className="text-3xl animate-bounce">⚡</span>
              <div>
                <p className="font-bold text-xl text-white">INCOMING: {newMessageAlert.senderName}</p>
                <p className="text-purple-200 text-sm font-mono">Click to respond immediately</p>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} className="px-8 py-4 bg-white/10 border border-white/30 text-white rounded-xl font-bold text-sm backdrop-blur-sm hover:bg-white/20">[ REPLY ]</motion.button>
          </motion.div>
        )}

        {/* Stats - Futuristic Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[
            { label: 'TOTAL CHATS', value: stats.totalConversations || 0, color: 'from-purple-500 to-blue-500', icon: '📡' },
            { label: 'ACTIVE NOW', value: stats.activeConversations || 0, color: 'from-green-500 to-cyan-500', icon: '🟢' },
            { label: 'ARCHIVED', value: stats.closedConversations || 0, color: 'from-gray-500 to-slate-500', icon: '📁' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="stat-card scan-line group cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-mono tracking-widest mb-2">{stat.label}</p>
                  <p className="text-5xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{stat.value}</p>
                </div>
                <div className={`text-4xl opacity-50 group-hover:opacity-100 transition-opacity`}>{stat.icon}</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs - Cyberpunk Style */}
        <div className="flex items-center space-x-3 mb-6">
          {['active', 'closed'].map((f) => (
            <motion.button key={f} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFilter(f as 'active' | 'closed')}
              className={`px-6 py-3 rounded-xl text-sm font-bold font-mono tracking-wider transition-all border ${
                filter === f 
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 neon-glow' 
                  : 'bg-gray-900/50 border-gray-700/50 text-gray-500 hover:border-gray-600'
              }`}>
              {f === 'active' ? '◉ ACTIVE' : '◎ CLOSED'}
            </motion.button>
          ))}
          {conversations.length > 0 && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleDeleteAll}
              className="ml-auto px-5 py-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl text-sm font-bold font-mono hover:bg-red-500/30 flex items-center space-x-2">
              <HiTrash className="w-4 h-4" /><span>CLEAR_ALL()</span>
            </motion.button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="> SEARCH_CONVERSATIONS..."
            className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-700/50 rounded-xl font-mono text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder-gray-600" />
        </div>

        {/* Conversations */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-24 h-24 bg-gray-900/50 border border-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <HiGlobeAlt className="w-12 h-12 text-gray-600" />
            </div>
            <p className="text-xl font-bold text-gray-500 font-mono">NO_{filter.toUpperCase()}_CHATS</p>
            <p className="text-gray-600 mt-2 font-mono text-sm">Waiting for incoming connections...</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filtered.map((c, i) => (
              <motion.div key={c.roomId} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-6 animate-border-flow group hover:border-purple-500/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black border ${
                      c.status === 'active' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-gray-500/20 border-gray-500/50 text-gray-400'
                    }`}>
                      {c.displayName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold text-white">{c.displayName}</h3>
                        <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                          c.status === 'active' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-gray-500/10 border-gray-500/30 text-gray-400'
                        }`}>{c.status.toUpperCase()}</span>
                        {c.anonymous && <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-purple-500/10 border border-purple-500/30 text-purple-400">ANON</span>}
                        {c.mood && <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">{getMoodEmoji(c.mood)} {c.mood.toUpperCase()}</span>}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 font-mono">
                        ID:{c.roomId?.substring(0, 8)}... • {format(new Date(c.createdAt), 'MMM d, HH:mm')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {c.status === 'active' ? (
                      <>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/support/${c.roomId}`)}
                          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-bold font-mono border border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
                          [ REPLY ]
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleStatusChange(c.roomId, 'closed')}
                          className="p-3 text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-xl transition-all border border-transparent hover:border-yellow-500/30">
                          <HiArchiveBox className="w-5 h-5" />
                        </motion.button>
                      </>
                    ) : (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleStatusChange(c.roomId, 'active')}
                        className="px-5 py-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-sm font-bold font-mono hover:bg-green-500/20 flex items-center space-x-2">
                        <HiArrowPath className="w-4 h-4" /><span>REOPEN</span>
                      </motion.button>
                    )}
                    {deleteConfirm === c.roomId ? (
                      <div className="flex space-x-2">
                        <button onClick={() => handleDelete(c.roomId)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold font-mono">CONFIRM</button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-gray-700 rounded-lg text-xs font-mono">CANCEL</button>
                      </div>
                    ) : (
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setDeleteConfirm(c.roomId)}
                        className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/30">
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

