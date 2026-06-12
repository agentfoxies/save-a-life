import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { HiChatBubbleLeftRight, HiMagnifyingGlass, HiTrash, HiBell, HiBellAlert, HiArchiveBox, HiArrowPath } from 'react-icons/hi2'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'
import { conversationService } from '../services/api'
import api from '../services/api'
import StaffStatus from '../components/StaffStatus'
import StaffActivity from '../components/StaffActivity'

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
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        if (!token) { navigate('/admin/login'); return }
        await api.get('/auth/verify', { headers: { Authorization: `Bearer ${token}` } })
      } catch { localStorage.clear(); navigate('/admin/login') }
    }
    checkAuth()
    const interval = setInterval(checkAuth, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => { if ('Notification' in window) setNotificationsEnabled(Notification.permission === 'granted') }, [])

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) { toast.error('Not supported'); return }
    if (Notification.permission === 'denied') { toast.error('Blocked'); return }
    if (Notification.permission === 'granted') { setNotificationsEnabled(true); return }
    try {
      const p = await Notification.requestPermission()
      if (p === 'granted') { setNotificationsEnabled(true); new Notification('Ready!', { body: 'Alerts active', icon: '/favicon-new.png' }) }
    } catch { toast.error('Failed') }
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

  const filtered = conversations.filter(c => c.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || c.roomId?.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-20 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold">Support Dashboard</h1>
          <div className="flex items-center space-x-3">
            <StaffStatus />
            <button onClick={requestNotificationPermission} className={`px-4 py-2 rounded-lg text-sm flex items-center space-x-2 ${notificationsEnabled ? 'bg-green-100 text-green-700' : 'bg-yellow-500 text-white'}`}>
              {notificationsEnabled ? <HiBellAlert className="w-4 h-4" /> : <HiBell className="w-4 h-4" />}<span>{notificationsEnabled ? 'ON' : 'Alerts'}</span>
            </button>
            {conversations.length > 0 && <button onClick={handleDeleteAll} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm flex items-center space-x-2"><HiTrash className="w-4 h-4" /><span>Delete {filter}</span></button>}
          </div>
        </div>
        <StaffActivity />
        {newMessageAlert && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 mt-4 p-4 bg-blue-100 border-2 border-blue-400 rounded-xl flex items-center justify-between cursor-pointer" onClick={() => navigate(`/support/${newMessageAlert.roomId}`)}>
            <div className="flex items-center space-x-3"><span>🔔</span><p className="font-bold">{newMessageAlert.senderName}!</p></div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Reply →</button>
          </motion.div>
        )}
        <div className="grid grid-cols-3 gap-6 mb-8 mt-4">
          <div className="glass-card rounded-2xl p-6"><p className="text-sm text-gray-500">Total</p><p className="text-3xl font-bold">{stats.totalConversations || 0}</p></div>
          <div className="glass-card rounded-2xl p-6"><p className="text-sm text-gray-500">Active</p><p className="text-3xl font-bold text-green-600">{stats.activeConversations || 0}</p></div>
          <div className="glass-card rounded-2xl p-6"><p className="text-sm text-gray-500">Closed</p><p className="text-3xl font-bold text-gray-400">{stats.closedConversations || 0}</p></div>
        </div>
        <div className="flex space-x-2 mb-4">
          <button onClick={() => setFilter('active')} className={`px-4 py-2 rounded-lg text-sm ${filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>🟢 Active</button>
          <button onClick={() => setFilter('closed')} className={`px-4 py-2 rounded-lg text-sm ${filter === 'closed' ? 'bg-gray-600 text-white' : 'bg-gray-100'}`}>📁 Closed</button>
        </div>
        <div className="relative mb-6"><HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className="pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl w-full" /></div>
        {isLoading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div> :
         filtered.length === 0 ? <div className="text-center py-12 text-gray-500"><HiChatBubbleLeftRight className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p>No {filter} conversations</p></div> :
         <div className="space-y-4">{filtered.map(c => (
           <motion.div key={c.roomId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
             <div className="flex items-center justify-between">
               <div>
                 <div className="flex items-center space-x-3 mb-1">
                   {c.status === 'active' && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                   <h3 className="text-lg font-semibold">{c.displayName}</h3>
                   <span className={`px-2 py-0.5 rounded-full text-xs ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200'}`}>{c.status}</span>
                   {c.anonymous && <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">Anon</span>}
                   {c.mood && <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">{c.mood}</span>}
                 </div>
                 <div className="text-sm text-gray-500">Room: {c.roomId?.substring(0, 8)}... • {format(new Date(c.createdAt), 'MMM d, h:mm a')}</div>
               </div>
               <div className="flex items-center space-x-2">
                 {c.status === 'active' ? (
                   <><button onClick={() => navigate(`/support/${c.roomId}`)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Reply</button>
                   <button onClick={() => handleStatusChange(c.roomId, 'closed')} className="p-2 text-gray-400 hover:text-yellow-500"><HiArchiveBox className="w-5 h-5" /></button></>
                 ) : <button onClick={() => handleStatusChange(c.roomId, 'active')} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm flex items-center space-x-1"><HiArrowPath className="w-4 h-4" /><span>Reopen</span></button>}
                 {deleteConfirm === c.roomId ? (
                   <div className="flex space-x-2"><button onClick={() => handleDelete(c.roomId)} className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs">Confirm</button><button onClick={() => setDeleteConfirm(null)} className="px-3 py-2 bg-gray-200 rounded-lg text-xs">Cancel</button></div>
                 ) : <button onClick={() => setDeleteConfirm(c.roomId)} className="p-2 text-gray-400 hover:text-red-500"><HiTrash className="w-5 h-5" /></button>}
               </div>
             </div>
           </motion.div>
         ))}</div>}
      </div>
    </motion.div>
  )
}
export default Dashboard
