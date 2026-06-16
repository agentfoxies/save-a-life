import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const moods = [
  { emoji: '😄', label: 'Good', color: 'bg-green-100 hover:bg-green-200' },
  { emoji: '🙂', label: 'Okay', color: 'bg-blue-100 hover:bg-blue-200' },
  { emoji: '😐', label: 'Neutral', color: 'bg-yellow-100 hover:bg-yellow-200' },
  { emoji: '😔', label: 'Sad', color: 'bg-orange-100 hover:bg-orange-200' },
  { emoji: '😢', label: 'Struggling', color: 'bg-red-100 hover:bg-red-200' },
]

const MoodCheck = () => {
  const navigate = useNavigate()

  const selectMood = (mood: string) => {
    localStorage.setItem('userMood', mood)
    navigate('/join')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="max-w-lg w-full text-center">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">How are you feeling today?</h1>
          <p className="text-gray-500 mb-8">This helps us understand how to best support you. Remember, this is a safe space for anything on your mind.</p>
          <div className="grid grid-cols-1 gap-4">
            {moods.map((mood) => (
              <motion.button
                key={mood.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectMood(mood.label)}
                className={`${mood.color} p-4 rounded-xl text-xl font-medium flex items-center justify-center space-x-3 transition-all`}
              >
                <span className="text-3xl">{mood.emoji}</span>
                <span>{mood.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default MoodCheck
