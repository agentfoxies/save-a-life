import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiShieldCheck, HiTrash, HiArrowUp, HiArrowDown } from 'react-icons/hi2'
import toast from 'react-hot-toast'
import axios from 'axios'

interface Admin {
  _id: string; username: string; role: string; approved: boolean; currentStatus?: string; lastActive?: string; createdAt: string
}

const API_URL = 'https://save-a-life-api.onrender.com/api'

const AdminPanel = () => {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, owners: 0 })

  useEffect(() => { const d = localStorage.getItem('adminUser'); if (d) setUser(JSON.parse(d)); loadAdmins() }, [])
  const getToken = () => localStorage.getItem('adminToken')

  const loadAdmins = async () => {
    try {
      const token = getToken()
      const res = await axios.get(`${API_URL}/auth/admins`, { headers: { Authorization: `Bearer ${token}` } })
      const admins = Array.isArray(res.data) ? res.data : []
      setAdmins(admins)
      setStats({ total: admins.length, approved: admins.filter((a: Admin) => a.approved).length, pending: admins.filter((a: Admin) => !a.approved).length, owners: admins.filter((a: Admin) => a.role === 'owner').length })
    } catch { toast.error('Failed to load') } finally { setLoading(false) }
  }

  const getStatusDisplay = (admin: Admin) => {
    if (!admin.approved) return { emoji: '⏳', text: 'PENDING', color: 'text-yellow-400' }
    switch (admin.currentStatus) {
      case 'online': return { emoji: '🟢', text: 'ONLINE', color: 'text-green-400' }
      case 'busy': return { emoji: '🟡', text: 'BUSY', color: 'text-yellow-400' }
      case 'away': return { emoji: '🟠', text: 'AWAY', color: 'text-orange-400' }
      default: return { emoji: '⚫', text: 'OFFLINE', color: 'text-gray-500' }
    }
  }

  const getLastActive = (d?: string) => {
    if (!d) return ''
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (diff < 60) return 'just now'; if (diff < 3600) return `${Math.floor(diff/60)}m`; if (diff < 86400) return `${Math.floor(diff/3600)}h`; return new Date(d).toLocaleDateString()
  }

  const handleApprove = async (id: string) => { try { await axios.patch(`${API_URL}/auth/admins/${id}/approve`, {}, { headers: { Authorization: `Bearer ${getToken()}` } }); toast.success('Approved'); loadAdmins() } catch {} }
  const handlePromote = async (id: string) => { if (!window.confirm('Promote to Owner?')) return; try { await axios.patch(`${API_URL}/auth/admins/${id}/promote`, {}, { headers: { Authorization: `Bearer ${getToken()}` } }); toast.success('Promoted'); loadAdmins() } catch {} }
  const handleDemote = async (id: string) => { if (!window.confirm('Demote to Moderator?')) return; try { await axios.patch(`${API_URL}/auth/admins/${id}/demote`, {}, { headers: { Authorization: `Bearer ${getToken()}` } }); toast.success('Demoted'); loadAdmins() } catch {} }
  const handleRemove = async (id: string) => { if (!window.confirm('Remove permanently?')) return; try { await axios.delete(`${API_URL}/auth/admins/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } }); toast.success('Removed'); loadAdmins() } catch {} }

  if (user?.role !== 'owner') return <div className="pt-20 text-center"><HiShieldCheck className="w-20 h-20 mx-auto text-red-500 mb-4" /><h1 className="text-3xl font-bold text-white">ACCESS DENIED</h1><p className="text-gray-500 mt-2 font-mono">ROOT privileges required</p></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen hero-gradient grid-bg pt-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">// ADMIN_PANEL</h1>
            <p className="text-gray-500 font-mono text-sm mt-1">ROOT ACCESS • MANAGE STAFF</p>
          </div>
          <button onClick={loadAdmins} className="px-6 py-3 bg-purple-500/20 border border-purple-500/50 text-purple-300 rounded-xl font-mono text-sm font-bold hover:bg-purple-500/30">[ REFRESH ]</button>
        </motion.div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[{ label: 'TOTAL', value: stats.total, color: 'text-white' },{ label: 'OWNERS', value: stats.owners, color: 'text-yellow-400' },{ label: 'ACTIVE', value: stats.approved, color: 'text-green-400' },{ label: 'PENDING', value: stats.pending, color: 'text-yellow-400' }].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.1 }} className="stat-card text-center">
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p><p className="text-xs text-gray-500 font-mono mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {loading ? <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div> :
         admins.length === 0 ? <div className="text-center py-20 text-gray-500 font-mono">NO_STAFF_FOUND</div> :
         <div className="space-y-4">{admins.map((admin) => {
           const status = getStatusDisplay(admin)
           return (
             <motion.div key={admin._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-2xl p-6 animate-border-flow">
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-4">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black border ${admin.role === 'owner' ? 'bg-yellow-500/20 border-yellow-500/50' : admin.approved ? 'bg-green-500/20 border-green-500/50' : 'bg-gray-500/20 border-gray-500/50'}`}>
                     {admin.role === 'owner' ? '👑' : status.emoji}
                   </div>
                   <div>
                     <div className="flex items-center space-x-2">
                       <h3 className="font-bold text-white text-lg">{admin.username}</h3>
                       {admin.username === 'malek' && <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-red-500/20 border border-red-500/50 text-red-400">SUPER</span>}
                       {admin.role === 'owner' && admin.username !== 'malek' && <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-yellow-500/20 border border-yellow-500/50 text-yellow-400">OWNER</span>}
                       {admin.role === 'moderator' && <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-blue-500/20 border border-blue-500/50 text-blue-400">MOD</span>}
                     </div>
                     <div className="flex items-center space-x-3 text-xs mt-1">
                       <span className="text-gray-500 font-mono">JOINED {new Date(admin.createdAt).toLocaleDateString()}</span>
                       <span className="text-gray-600">•</span>
                       <span className={`font-mono ${status.color}`}>{status.text}</span>
                       {getLastActive(admin.lastActive) && <><span className="text-gray-600">•</span><span className="text-gray-500 font-mono">{getLastActive(admin.lastActive)}</span></>}
                     </div>
                   </div>
                 </div>
                 <div className="flex items-center space-x-2">
                   {!admin.approved && <button onClick={() => handleApprove(admin._id)} className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-xs font-mono font-bold hover:bg-green-500/30">APPROVE</button>}
                   {admin.approved && admin.role !== 'owner' && <button onClick={() => handlePromote(admin._id)} className="p-2 text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg" title="Promote"><HiArrowUp className="w-4 h-4" /></button>}
                   {admin.role === 'owner' && admin.username !== user?.username && <button onClick={() => handleDemote(admin._id)} className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg" title="Demote"><HiArrowDown className="w-4 h-4" /></button>}
                   {admin.username !== user?.username && <button onClick={() => handleRemove(admin._id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><HiTrash className="w-5 h-5" /></button>}
                 </div>
               </div>
             </motion.div>
           )
         })}</div>}
      </div>
    </motion.div>
  )
}
export default AdminPanel
