import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiUser, HiQuestionMarkCircle } from 'react-icons/hi2'
import toast from 'react-hot-toast'
import { useChat } from '../context/ChatContext'
import { conversationService } from '../services/api'

const anonymousNames = [
  'Anonymous Tiger',
  'Anonymous Falcon',
  'Anonymous Ocean',
  'Anonymous Star',
  'Anonymous Wolf',
  'Anonymous Eagle',
  'Anonymous River',
  'Anonymous Moon',
  'Anonymous Phoenix',
  'Anonymous Dragon',
]

const JoinChat = () => {
  const [displayName, setDisplayName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setRoomId, setDisplayName: setContextDisplayName, clearChat } = useChat()

  const handleJoin = async () => {
    if (!isAnonymous && !displayName.trim()) {
      toast.error('Please enter a display name or choose to remain anonymous')
      return
    }

    setIsLoading(true)

    try {
      // Clear any old chat data first
      clearChat()
      localStorage.removeItem('roomId')
      localStorage.removeItem('displayName')

      const response = await conversationService.create({
        displayName: displayName.trim(),
        anonymous: isAnonymous,
      })

      const { roomId, displayName: assignedName } = response.data

      setRoomId(roomId)
      setContextDisplayName(assignedName)

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center px-4 pt-20"
    >
      <div className="max-w-md w-full">
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="glass-card rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiUser className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Join Support Chat
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Choose how you'd like to be identified
            </p>
          </div>

          <div className="space-y-6">
            {/* Display Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter Display Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isAnonymous}
                  placeholder="Your display name"
                  maxLength={30}
                  className="glass-input w-full px-4 py-3 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {isAnonymous && (
                  <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-700/50 rounded-xl flex items-center justify-center">
                    <span className="text-sm text-gray-500">Random name will be generated</span>
                  </div>
                )}
              </div>
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAnonymous ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAnonymous ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Continue Anonymously
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  We'll generate a random name for you
                </p>
              </div>
            </div>

            {/* Anonymous Name Examples */}
            {isAnonymous && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <HiQuestionMarkCircle className="w-5 h-5 text-primary-600" />
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Example Anonymous Names:
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {anonymousNames.slice(0, 8).map((name) => (
                    <span
                      key={name}
                      className="px-3 py-1 bg-white dark:bg-gray-600 rounded-full text-xs text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-500"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Join Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoin}
              disabled={isLoading}
              className="btn-primary w-full py-4 rounded-xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting...</span>
                </div>
              ) : (
                'Join Chat'
              )}
            </motion.button>
          </div>

          <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
            By joining, you agree to our terms and understand this is not a replacement for professional medical care.
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default JoinChat
