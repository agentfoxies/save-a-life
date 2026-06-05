import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { useState } from 'react'
import { HiXMark } from 'react-icons/hi2'

interface MessageProps {
  _id: string
  senderType: 'visitor' | 'support'
  senderName: string
  content: string
  imageUrl?: string
  read: boolean
  createdAt: string
  onDelete?: (messageId: string) => void
}

const ChatMessage = ({ _id, senderType, senderName, content, imageUrl, read, createdAt, onDelete }: MessageProps) => {
  const isVisitor = senderType === 'visitor'
  const [showDelete, setShowDelete] = useState(false)

  const handleDelete = () => {
    if (onDelete && window.confirm('Delete this message?')) {
      onDelete(_id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isVisitor ? 'justify-end' : 'justify-start'} mb-4`}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <div className={`max-w-[75%] ${isVisitor ? 'order-2' : 'order-1'}`}>
        <div className={`text-xs mb-1 ${isVisitor ? 'text-right' : 'text-left'}`}>
          <span className={`font-medium ${isVisitor ? 'text-primary-600 dark:text-primary-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
            {senderName}
          </span>
          {isVisitor && read && (
            <span className="ml-2 text-gray-400">✓</span>
          )}
        </div>

        <div className="relative group">
          <div className={`rounded-2xl px-4 py-2 ${
            isVisitor
              ? 'bg-primary-600 text-white rounded-br-sm'
              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm shadow-md'
          }`}>
            {imageUrl && (
              <div className="mb-2">
                <img src={imageUrl} alt="Shared" className="rounded-lg max-w-full cursor-pointer hover:opacity-90"
                  onClick={() => window.open(imageUrl, '_blank')} />
              </div>
            )}
            <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          </div>

          {showDelete && onDelete && (
            <button
              onClick={handleDelete}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
              title="Delete message"
            >
              <HiXMark className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className={`text-xs mt-1 text-gray-400 ${isVisitor ? 'text-right' : 'text-left'}`}>
          {format(new Date(createdAt), 'h:mm a')}
        </div>
      </div>
    </motion.div>
  )
}

export default ChatMessage
