import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { HiChatBubbleLeftRight, HiLockOpen, HiLockClosed, HiMagnifyingGlass, HiTrash } from 'react-icons/hi2'
import toast from 'react-hot-toast'
import { conversationService } from '../services/api'
import api from '../services/api'

interface Conversation {
  roomId: string
  displayName: string
  anonymous: boolean
  status: 'active' | 'closed'
  createdAt: string
  updatedAt: string
}

interface Stats {
  totalConversations: number
  activeConversations: number
  closedConversations: number
}

const Dashboard = () => {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [stats, setStats] = useState<Stats>({
    totalConversations: 0,
    activeConversations: 0,
    closedConversations: 0,
  })
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const [convResponse, statsResponse] = await Promise.all([
        conversationService.getAll(filter),
        conversationService.getStats(),
      ])
      const convData = Array.isArray(convResponse.data) ? convResponse.data : []
      setConversations(convData)
      setStats(statsResponse.data || { totalConversations: 0, activeConversations: 0, closedConversations: 0 })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setConversations([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [filter])

  const handleStatusChange = async (roomId: string, newStatus: 'active' | 'closed') => {
    try {
      await conversationService.updateStatus(roomId, newStatus)
      toast.success(`Conversation ${newStatus === 'active' ? 'reopened' : 'closed'}`)
      loadData()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (roomId: string) => {
    try {
      // Delete all messages in the room first
      await api.delete(`/conversations/${roomId}`)
      toast.success('Conversation deleted permanently')
      setDeleteConfirm(null)
      loadData()
    } catch (error) {
      toast.error('Failed to delete conversation')
    }
  }

  // Delete ALL conversations
  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL conversations? This cannot be undone!')) return
    
    try {
      await api.delete('/conversations')
      toast.success('All conversations deleted')
      loadData()
    } catch (error) {
      toast.error('Failed to delete all conversations')
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.roomId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statsCards = [
    { title: 'Total Chats', value: stats.totalConversations || 0, icon: HiChatBubbleLeftRight, color: 'from-blue-500 to-cyan-500' },
    { title: 'Active Chats', value: stats.activeConversations || 0, icon: HiLockOpen, color: 'from-green-500 to-teal-500' },
    { title: 'Closed Chats', value: stats.closedConversations || 0, icon: HiLockClosed, color: 'from-gray-500 to-slate-500' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-20 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Support Dashboard</h1>
          {conversations.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center space-x-2"
            >
              <HiTrash className="w-4 h-4" />
              <span>Delete All</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsCards.map((stat) => (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex space-x-2">
            {(['all', 'active', 'closed'] as const).map((status) => (
              <button key={status} onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === status ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..." className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg w-64"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <HiChatBubbleLeftRight className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conv) => (
              <motion.div key={conv.roomId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{conv.displayName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        conv.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>{conv.status}</span>
                      {conv.anonymous && <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Anonymous</span>}
                    </div>
                    <div className="text-sm text-gray-500">
                      Room: {conv.roomId?.substring(0, 8)}... • Created: {format(new Date(conv.createdAt), 'MMM d, h:mm a')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => navigate(`/support/${conv.roomId}`)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                      Reply
                    </button>
                    <button onClick={() => handleStatusChange(conv.roomId, conv.status === 'active' ? 'closed' : 'active')}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        conv.status === 'active' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}>
                      {conv.status === 'active' ? 'Close' : 'Reopen'}
                    </button>
                    {deleteConfirm === conv.roomId ? (
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleDelete(conv.roomId)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">
                          Confirm Delete
                        </button>
                        <button onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-xs hover:bg-gray-400">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(conv.roomId)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                        <HiTrash className="w-5 h-5" />
                      </button>
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
