import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiShieldCheck, HiCheck, HiTrash, HiArrowUp, HiArrowDown } from 'react-icons/hi2'
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

  useEffect(() => {
    const userData = localStorage.getItem('adminUser')
    if (userData) setUser(JSON.parse(userData))
    loadAdmins()
  }, [])

  const getToken = () => localStorage.getItem('adminToken')

  const loadAdmins = async () => {
    try {
      const token = getToken()
      const response = await axios.get(`${API_URL}/auth/admins`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const admins = Array.isArray(response.data) ? response.data : []
      setAdmins(admins)
      setStats({
        total: admins.length,
        approved: admins.filter((a: Admin) => a.approved).length,
        pending: admins.filter((a: Admin) => !a.approved).length,
        owners: admins.filter((a: Admin) => a.role === 'owner').length
      })
    } catch (error: any) {
      toast.error('Failed to load admins')
    } finally {
      setLoading(false)
    }
  }

  const getStatusDisplay = (admin: Admin) => {
    if (!admin.approved) return { emoji: '⏳', text: 'Pending', color: 'text-yellow-600' }
    const status = admin.currentStatus || 'offline'
    switch (status) {
      case 'online': return { emoji: '🟢', text: 'Online', color: 'text-green-600' }
      case 'busy': return { emoji: '🟡', text: 'Busy', color: 'text-yellow-600' }
      case 'away': return { emoji: '🟠', text: 'Away', color: 'text-orange-600' }
      default: return { emoji: '⚫', text: 'Offline', color: 'text-gray-500' }
    }
  }

  const getLastActive = (lastActive?: string) => {
    if (!lastActive) return ''
    const diff = Math.floor((Date.now() - new Date(lastActive).getTime()) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return new Date(lastActive).toLocaleDateString()
  }

  const handleApprove = async (adminId: string) => {
    try {
      const token = getToken()
      await axios.patch(`${API_URL}/auth/admins/${adminId}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Approved!'); loadAdmins()
    } catch { toast.error('Failed') }
  }

  const handlePromote = async (adminId: string) => {
    if (!window.confirm('Make this person an Owner? They will have full access.')) return
    try {
      const token = getToken()
      await axios.patch(`${API_URL}/auth/admins/${adminId}/promote`, {}, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Promoted to Owner!'); loadAdmins()
    } catch { toast.error('Failed') }
  }

  const handleDemote = async (adminId: string) => {
    if (!window.confirm('Demote this person to Moderator?')) return
    try {
      const token = getToken()
      await axios.patch(`${API_URL}/auth/admins/${adminId}/demote`, {}, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Demoted to Moderator'); loadAdmins()
    } catch { toast.error('Failed') }
  }

  const handleRemove = async (adminId: string) => {
    if (!window.confirm('Remove this admin permanently?')) return
    try {
      const token = getToken()
      await axios.delete(`${API_URL}/auth/admins/${adminId}`, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Removed!'); loadAdmins()
    } catch { toast.error('Failed') }
  }

  if (user?.role !== 'owner') {
    return (
      <div className="pt-20 text-center">
        <HiShieldCheck className="w-20 h-20 mx-auto text-red-500 mb-4" />
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-gray-500 mt-2">Only the owner can access this panel.</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Admin Management</h1>
            <p className="text-gray-500">Manage staff access & roles</p>
          </div>
          <button onClick={loadAdmins} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Refresh</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-xl p-4 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-gray-500">Total</p></div>
          <div className="glass-card rounded-xl p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{stats.owners}</p><p className="text-xs text-gray-500">Owners</p></div>
          <div className="glass-card rounded-xl p-4 text-center"><p className="text-2xl font-bold text-green-600">{stats.approved}</p><p className="text-xs text-gray-500">Approved</p></div>
          <div className="glass-card rounded-xl p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p><p className="text-xs text-gray-500">Pending</p></div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : admins.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No staff accounts</div>
        ) : (
          <div className="space-y-4">
            {admins.map((admin) => {
              const status = getStatusDisplay(admin)
              const lastActive = getLastActive(admin.lastActive)
              return (
                <motion.div key={admin._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${admin.role === 'owner' ? 'bg-yellow-100' : admin.approved ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {admin.role === 'owner' ? '👑' : status.emoji}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{admin.username}</h3>
                          {admin.username === "malek" ? <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full">👑 Super Owner</span> : admin.role === "owner" ? <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">Owner</span> : null}
                          {admin.role === 'moderator' && <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">Mod</span>}
                        </div>
                        <div className="flex items-center space-x-3 text-sm mt-1">
                          <span className="text-gray-500">Joined {new Date(admin.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className={status.color}>{status.text}</span>
                          {lastActive && <><span>•</span><span className="text-gray-400">Active: {lastActive}</span></>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!admin.approved && (
                        <button onClick={() => handleApprove(admin._id)} className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 flex items-center space-x-1">
                          <HiCheck className="w-3 h-3" /><span>Approve</span>
                        </button>
                      )}
                      {admin.approved && admin.role !== 'owner' && (
                        <button onClick={() => handlePromote(admin._id)} className="p-2 text-gray-400 hover:text-yellow-500" title="Promote to Owner">
                          <HiArrowUp className="w-4 h-4" />
                        </button>
                      )}
                      {admin.role === 'owner' && admin.username !== user?.username && (
                        <button onClick={() => handleDemote(admin._id)} className="p-2 text-gray-400 hover:text-blue-500" title="Demote to Moderator">
                          <HiArrowDown className="w-4 h-4" />
                        </button>
                      )}
                      {admin.username !== user?.username && (
                        <button onClick={() => handleRemove(admin._id)} className="p-2 text-gray-400 hover:text-red-500">
                          <HiTrash className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default AdminPanel
