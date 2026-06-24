import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const moods = [
  { emoji: '😄', label: 'Good', desc: 'Feeling positive today', color: 'from-green-500 to-emerald-500', border: 'border-green-500/30', bg: 'bg-green-500/10', text: 'text-green-400' },
  { emoji: '🙂', label: 'Okay', desc: 'Doing alright, just want to talk', color: 'from-blue-500 to-cyan-500', border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  { emoji: '😐', label: 'Neutral', desc: 'Not sure how to feel', color: 'from-yellow-500 to-amber-500', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  { emoji: '😔', label: 'Sad', desc: 'Going through a rough time', color: 'from-orange-500 to-red-500', border: 'border-orange-500/30', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  { emoji: '😢', label: 'Struggling', desc: 'Really need someone to talk to', color: 'from-red-500 to-pink-500', border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400' },
]

const MoodCheck = () => {
  const navigate = useNavigate()

  const selectMood = (mood: string) => {
    localStorage.setItem('userMood', mood)
    navigate('/join')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen hero-gradient grid-bg flex items-center justify-center px-4 pt-20">
      <div className="max-w-2xl w-full text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-10">
          <h1 className="text-4xl font-black text-white mb-2">
            How are you <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">feeling</span> today?
          </h1>
          <p className="text-gray-400 mb-10 text-lg">This helps us understand how to best support you. All anonymous.</p>
          
          <div className="space-y-4">
            {moods.map((mood) => (
              <motion.button
                key={mood.label}
                whileHover={{ scale: 1.03, x: 10 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => selectMood(mood.label)}
                className={`w-full p-6 rounded-2xl border ${mood.border} ${mood.bg} flex items-center justify-between group transition-all hover:shadow-xl text-left`}
              >
                <div className="flex items-center space-x-5">
                  <span className="text-5xl">{mood.emoji}</span>
                  <div>
                    <h3 className={`text-2xl font-bold ${mood.text}`}>{mood.label}</h3>
                    <p className="text-gray-500 text-sm mt-1">{mood.desc}</p>
                  </div>
                </div>
                <span className="text-gray-600 group-hover:text-white transition-colors text-2xl">→</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default MoodCheck
