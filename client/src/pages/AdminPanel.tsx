import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiShieldCheck, HiCheck, HiTrash } from 'react-icons/hi2'
import toast from 'react-hot-toast'
import api from '../services/api'

interface Admin {
  _id: string
  username: string
  role: string
  approved: boolean
  createdAt: string
}

const AdminPanel = () => {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('adminUser')
    if (userData) setUser(JSON.parse(userData))
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await api.get('/auth/admins', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAdmins(response.data)
    } catch (error) {
      toast.error('Failed to load admins')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (adminId: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      await api.patch(`/auth/admins/${adminId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Admin approved!')
      loadAdmins()
    } catch (error) {
      toast.error('Failed to approve')
    }
  }

  const handleRemove = async (adminId: string) => {
    if (!window.confirm('Remove this admin permanently?')) return
    try {
      const token = localStorage.getItem('adminToken')
      await api.delete(`/auth/admins/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Admin removed')
      loadAdmins()
    } catch (error) {
      toast.error('Failed to remove')
    }
  }

  const isOwner = user?.role === 'owner'

  if (!isOwner) {
    return (
      <div className="pt-20 text-center">
        <HiShieldCheck className="w-20 h-20 mx-auto text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
        <p className="text-gray-500 mt-2">Only the owner can access this panel.</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Admin Management</h1>
        <p className="text-gray-500 mb-8">Approve or remove admin accounts</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {admins.map((admin) => (
              <motion.div key={admin._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    admin.role === 'owner' ? 'bg-yellow-100 text-yellow-700' :
                    admin.approved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {admin.role === 'owner' ? '👑' : admin.approved ? '✅' : '⏳'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{admin.username}</h3>
                    <p className="text-sm text-gray-500">
                      {admin.role} • {admin.approved ? 'Approved' : 'Pending Approval'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {!admin.approved && admin.role !== 'owner' && (
                    <button onClick={() => handleApprove(admin._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center space-x-1">
                      <HiCheck className="w-4 h-4" /><span>Approve</span>
                    </button>
                  )}
                  {admin.role !== 'owner' && (
                    <button onClick={() => handleRemove(admin._id)}
                      className="p-2 text-gray-400 hover:text-red-500">
                      <HiTrash className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default AdminPanel
