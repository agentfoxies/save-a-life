import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiLockClosed } from 'react-icons/hi2'
import toast from 'react-hot-toast'
import api from '../services/api'

const AdminLogin = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post('/auth/login', { username, password })
      localStorage.setItem('adminToken', response.data.token)
      localStorage.setItem('adminUser', JSON.stringify(response.data.user))
      toast.success('Welcome!')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/register', { username, password })
      toast.success('Registration submitted! Waiting for owner approval.')
      setIsRegister(false)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="max-w-md w-full">
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiLockClosed className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isRegister ? 'Register' : 'Admin Login'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isRegister ? 'Request access (requires approval)' : 'Restricted access'}
            </p>
          </div>

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50">
              {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
            </motion.button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              {isRegister ? 'Already have an account? Login' : 'Need access? Register here'}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default AdminLogin
