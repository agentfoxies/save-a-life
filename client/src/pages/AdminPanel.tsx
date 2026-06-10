import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiShieldCheck, HiCheck, HiTrash } from 'react-icons/hi2'
import toast from 'react-hot-toast'
import axios from 'axios'

interface Admin {
  _id: string; username: string; role: string; approved: boolean; createdAt: string
}

const API_URL = 'https://save-a-life-api.onrender.com/api'

const AdminPanel = () => {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

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
      setAdmins(Array.isArray(response.data) ? response.data : [])
    } catch (error: any) {
      console.error('Load error:', error.response?.data)
      toast.error(error.response?.data?.error || 'Failed to load admins')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (adminId: string) => {
    try {
      const token = getToken()
      await axios.patch(`${API_URL}/auth/admins/${adminId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Approved!')
      loadAdmins()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed')
    }
  }

  const handleRemove = async (adminId: string) => {
    if (!window.confirm('Remove this admin permanently?')) return
    try {
      const token = getToken()
      await axios.delete(`${API_URL}/auth/admins/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Removed!')
      loadAdmins()
    } catch (error: any) {
      console.error('Remove error:', error.response?.data)
      toast.error(error.response?.data?.error || 'Failed to remove')
    }
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
            <p className="text-gray-500">Approve or remove admins</p>
          </div>
          <button onClick={loadAdmins} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Refresh</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : admins.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No admins found</div>
        ) : (
          <div className="space-y-4">
            {admins.map((admin) => (
              <motion.div key={admin._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${admin.role === 'owner' ? 'bg-yellow-100' : admin.approved ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {admin.role === 'owner' ? '👑' : admin.approved ? '✅' : '⏳'}
                  </div>
                  <div>
                    <h3 className="font-semibold">{admin.username} {admin.role === 'owner' && <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">Owner</span>}</h3>
                    <p className="text-sm text-gray-500">{admin.role} • {admin.approved ? 'Approved' : 'Pending'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {!admin.approved && admin.role !== 'owner' && (
                    <button onClick={() => handleApprove(admin._id)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center space-x-1">
                      <HiCheck className="w-4 h-4" /><span>Approve</span>
                    </button>
                  )}
                  {admin.role !== 'owner' && (
                    <button onClick={() => handleRemove(admin._id)} className="p-2 text-gray-400 hover:text-red-500">
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
