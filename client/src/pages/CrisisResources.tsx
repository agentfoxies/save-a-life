import { motion } from 'framer-motion'
import { HiHeart, HiFlag } from 'react-icons/hi2'
import Footer from '../components/Footer'

const CrisisResources = () => {
  const resources = [
    {
      country: '🇦🇪 United Arab Emirates',
      flag: true,
      hotlines: [
        { name: 'Mental Health Support Line', number: '800-4673 (800-HOPE)', desc: 'Free, confidential mental health support' },
        { name: 'Al Ameen Service', number: '800-4888', desc: 'Anonymous support for youth & families' },
        { name: 'Police Emergency', number: '999', desc: 'Immediate emergency response' },
        { name: 'Ambulance', number: '998', desc: 'Medical emergencies' },
      ],
      color: 'border-red-500/50'
    },
    {
      country: 'United States',
      hotlines: [
        { name: '988 Suicide & Crisis Lifeline', number: '988', desc: '24/7 free, confidential support' },
        { name: 'Crisis Text Line', number: 'Text HOME to 741741', desc: 'Text-based crisis counseling' },
      ],
      color: 'border-blue-500/50'
    },
    {
      country: 'United Kingdom',
      hotlines: [
        { name: 'NHS Emergency', number: '111', desc: 'Medical & mental health support' },
        { name: 'Samaritans', number: '116 123', desc: '24/7 emotional support' },
      ],
      color: 'border-blue-500/50'
    },
    {
      country: 'Canada',
      hotlines: [
        { name: 'Crisis Services Canada', number: '1-833-456-4566', desc: '24/7 crisis support' },
        { name: 'Kids Help Phone', number: '1-800-668-6868', desc: 'Youth mental health support' },
      ],
      color: 'border-blue-500/50'
    },
    {
      country: 'Australia',
      hotlines: [
        { name: 'Lifeline Australia', number: '13 11 14', desc: '24/7 crisis support' },
        { name: 'Beyond Blue', number: '1300 22 4636', desc: 'Anxiety & depression support' },
      ],
      color: 'border-blue-500/50'
    },
    {
      country: 'International',
      hotlines: [
        { name: 'Befrienders Worldwide', number: 'Visit befrienders.org', desc: 'Global emotional support network' },
        { name: 'International SOS', number: 'Visit internationalsos.com', desc: 'Worldwide crisis assistance' },
      ],
      color: 'border-gray-500/50'
    }
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen hero-gradient grid-bg pt-20">
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-16">
          <div className="w-24 h-24 mx-auto mb-6">
            <img src="/logo.png" alt="Save A Life" className="w-24 h-24 rounded-full object-cover shadow-2xl neon-glow" />
          </div>
          <h1 className="text-6xl font-black text-white mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-red-400 to-pink-400 bg-clip-text text-transparent">Crisis Resources</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            If you or someone you know needs immediate support, these resources are available 24/7.
          </p>
          <div className="flex justify-center space-x-4 mt-4">
            <span className="text-sm text-gray-500 font-mono">🇦🇪 UAE • 🌍 Global • ⏰ 24/7</span>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {resources.map((resource, index) => (
            <motion.div
              key={resource.country}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card rounded-2xl p-6 border ${resource.color} animate-border-flow`}
            >
              <div className="flex items-center space-x-3 mb-4">
                {resource.flag && <HiFlag className="w-6 h-6 text-red-400" />}
                <h3 className="text-xl font-bold text-white">{resource.country}</h3>
                {resource.flag && <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded-lg text-xs font-mono text-red-400">PRIORITY</span>}
              </div>
              <div className="grid gap-3">
                {resource.hotlines.map((hotline) => (
                  <div key={hotline.name} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-gray-700/30">
                    <div>
                      <p className="text-white font-semibold">{hotline.name}</p>
                      <p className="text-sm text-gray-500">{hotline.desc}</p>
                    </div>
                    <p className="text-2xl font-black text-green-400 font-mono">{hotline.number}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Message */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="max-w-2xl mx-auto mt-12 text-center">
          <div className="glass-card rounded-3xl p-8 border-green-500/30">
            <HiHeart className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-xl text-white font-bold mb-2">You Are Not Alone</p>
            <p className="text-gray-400">
              Reaching out is a sign of strength. There are people who care about you and want to help.
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </motion.div>
  )
}

export default CrisisResources
