import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API_URL = 'https://save-a-life-api.onrender.com/api'

const statuses = [
  { id: 'online', label: 'Online', color: 'bg-green-500', emoji: '🟢' },
  { id: 'busy', label: 'Busy', color: 'bg-yellow-500', emoji: '🟡' },
  { id: 'away', label: 'Away', color: 'bg-orange-500', emoji: '🟠' },
  { id: 'offline', label: 'Offline', color: 'bg-gray-500', emoji: '⚫' },
]

const StaffStatus = () => {
  const [status, setStatus] = useState('online')
  const [open, setOpen] = useState(false)

  const changeStatus = async (newStatus: string) => {
    setStatus(newStatus)
    setOpen(false)
    try {
      const token = localStorage.getItem('adminToken')
      await axios.patch(`${API_URL}/auth/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (error) {
      console.error('Failed to sync status')
    }
  }

  const current = statuses.find(s => s.id === status) || statuses[0]

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 shadow text-sm">
        <span className={`w-2 h-2 rounded-full ${current.color}`} />
        <span>{current.label}</span>
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="absolute top-12 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-2 z-50 min-w-[150px]">
          {statuses.map((s) => (
            <button key={s.id} onClick={() => changeStatus(s.id)}
              className={`flex items-center space-x-3 w-full px-4 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${status === s.id ? 'font-bold' : ''}`}>
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default StaffStatus
