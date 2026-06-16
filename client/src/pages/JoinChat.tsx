import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiUser, HiQuestionMarkCircle } from 'react-icons/hi2'
import toast from 'react-hot-toast'
import { conversationService } from '../services/api'

const anonymousNames = [
  'Anonymous Tiger', 'Anonymous Falcon', 'Anonymous Ocean', 'Anonymous Star',
  'Anonymous Wolf', 'Anonymous Eagle', 'Anonymous River', 'Anonymous Moon',
  'Anonymous Phoenix', 'Anonymous Dragon',
]

const JoinChat = () => {
  const [displayName, setDisplayName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleJoin = async () => {
    if (!isAnonymous && !displayName.trim()) {
      toast.error('Please enter a display name or choose to remain anonymous')
      return
    }

    setIsLoading(true)

    try {
      localStorage.removeItem('roomId')
      localStorage.removeItem('displayName')

      // Get the mood they picked
      const mood = localStorage.getItem('userMood') || ''

      const response = await conversationService.create({
        displayName: displayName.trim(),
        anonymous: isAnonymous,
        mood: mood
      })

      const { roomId, displayName: assignedName } = response.data

      localStorage.setItem('roomId', roomId)
      localStorage.setItem('displayName', assignedName)

      toast.success('Connected to support room!')
      navigate(`/chat/${roomId}`)
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast.error('Failed to connect. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="max-w-md w-full">
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiUser className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Join Support Chat</h1>
            <p className="text-gray-600 dark:text-gray-400">Choose how you'd like to be identified</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enter Display Name</label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                disabled={isAnonymous} placeholder="Your display name" maxLength={30}
                className="glass-input w-full px-4 py-3 rounded-xl text-gray-900 dark:text-white disabled:opacity-50" />
            </div>

            <div className="flex items-center space-x-4">
              <button onClick={() => setIsAnonymous(!isAnonymous)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAnonymous ? 'bg-primary-600' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnonymous ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Continue Anonymously</span>
            </div>

            {isAnonymous && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <HiQuestionMarkCircle className="w-5 h-5 text-primary-600" />
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Example Names:</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {anonymousNames.slice(0, 8).map((name) => (
                    <span key={name} className="px-3 py-1 bg-white dark:bg-gray-600 rounded-full text-xs">{name}</span>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleJoin} disabled={isLoading}
              className="btn-primary w-full py-4 rounded-xl text-lg font-semibold disabled:opacity-50">
              {isLoading ? 'Connecting...' : 'Start Talking'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default JoinChat
