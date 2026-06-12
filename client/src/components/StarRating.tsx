import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiStar } from 'react-icons/hi2'

interface StarRatingProps {
  roomId: string
  onClose: () => void
}

const StarRating = ({ roomId, onClose }: StarRatingProps) => {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://save-a-life-api.onrender.com/api'
      await fetch(`${API_URL}/conversations/${roomId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback })
      })
      setSubmitted(true)
      setTimeout(onClose, 2000)
    } catch (error) {
      console.error('Rating error:', error)
    }
  }

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-8">
        <p className="text-2xl">🙏</p>
        <p className="text-xl font-bold mt-2">Thank you for your feedback!</p>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-8 max-w-md mx-auto">
      <h3 className="text-xl font-bold text-center mb-4">How was your experience?</h3>
      <div className="flex justify-center space-x-2 mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setRating(star)}
            className={`text-4xl transition-colors ${star <= rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
          >
            <HiStar className="w-10 h-10" />
          </motion.button>
        ))}
      </div>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Any additional feedback? (optional)"
        className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-700 mb-4 resize-none"
        rows={3}
      />
      <button
        onClick={handleSubmit}
        disabled={rating === 0}
        className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-primary-700"
      >
        Submit
      </button>
    </motion.div>
  )
}

export default StarRating
