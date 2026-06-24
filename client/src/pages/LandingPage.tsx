import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiShieldCheck, HiChatBubbleLeftRight, HiUserGroup, HiLockClosed, HiGlobeAlt, HiPhone } from 'react-icons/hi2'
import Footer from '../components/Footer'

const fadeInUp = { initial: { opacity: 0, y: 60 }, animate: { opacity: 1, y: 0 } }
const stagger = { animate: { transition: { staggerChildren: 0.1 } } }

const LandingPage = () => {
  return (
    <motion.div initial="initial" animate="animate" exit={{ opacity: 0 }} className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient grid-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-purple-500/30 rounded-full animate-float"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${i * 0.5}s`, animationDuration: `${3 + Math.random() * 4}s` }} />
          ))}
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-8">
            
            {/* Trust Badge */}
            <motion.div variants={fadeInUp} className="flex justify-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-mono">
                <HiShieldCheck className="w-4 h-4" />
                <span>VERIFIED • ANONYMOUS • SECURE</span>
              </div>
            </motion.div>

            {/* Logo + Title */}
            <motion.div variants={fadeInUp} className="flex flex-col items-center">
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity }} className="mb-6">
                <img src="/logo.png" alt="Save A Life" className="w-28 h-28 rounded-full object-cover shadow-2xl neon-glow" />
              </motion.div>
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter">
                <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent neon-text">
                  Save A Life
                </span>
              </h1>
              <p className="text-2xl md:text-3xl text-gray-400 font-light mt-4 tracking-wide">
                Your Safe Space. <span className="text-purple-400">Always Listening.</span>
              </p>
            </motion.div>

            {/* Mission */}
            <motion.div variants={fadeInUp} className="glass-card rounded-3xl p-10 max-w-3xl mx-auto border-gray-700/30">
              <p className="text-xl text-gray-300 leading-relaxed">
                We are a <span className="text-purple-400 font-semibold">non-profit organization</span> dedicated to providing 
                <span className="text-blue-400 font-semibold"> free, anonymous emotional support</span> for anyone who needs someone to talk to. 
                Whether you're feeling lonely, stressed, anxious, or just need a listening ear — 
                <span className="text-cyan-400 font-semibold"> we're here for you.</span>
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/mood">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl text-xl font-bold shadow-2xl hover:shadow-purple-500/30 transition-all border border-purple-500/50 flex items-center space-x-3">
                  <HiChatBubbleLeftRight className="w-6 h-6" />
                  <span>Talk to Someone Now</span>
                </motion.button>
              </Link>
              <a href="#how-it-works">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-white/5 border border-gray-600 text-white rounded-2xl text-xl font-bold hover:bg-white/10 transition-all backdrop-blur-sm">
                  How It Works
                </motion.button>
              </a>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={fadeInUp} className="flex justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2"><HiLockClosed className="w-4 h-4 text-green-400" /><span>100% Anonymous</span></div>
              <div className="flex items-center space-x-2"><HiShieldCheck className="w-4 h-4 text-green-400" /><span>No Data Collected</span></div>
              <div className="flex items-center space-x-2"><HiGlobeAlt className="w-4 h-4 text-green-400" /><span>Free Forever</span></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">How It <span className="text-purple-400">Works</span></h2>
            <p className="text-gray-400 text-lg">Simple, anonymous, and completely free</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: HiUserGroup, title: 'Tell Us How You Feel', desc: 'Start with a quick mood check-in. No personal information required — ever.', color: 'from-purple-500 to-blue-500' },
              { step: '02', icon: HiChatBubbleLeftRight, title: 'Connect Privately', desc: 'Get matched with our supportive team in a private, encrypted chat room.', color: 'from-blue-500 to-cyan-500' },
              { step: '03', icon: HiShieldCheck, title: 'Speak Freely', desc: 'Share whatever is on your mind. We never store IPs, track you, or share your data.', color: 'from-cyan-500 to-green-500' },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }}
                className="glass-card rounded-3xl p-8 text-center group hover:border-purple-500/30 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 text-8xl font-black text-white/5">{item.step}</div>
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-black/30">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
            <h2 className="text-5xl font-black text-white mb-6">Your <span className="text-green-400">Privacy</span> Matters</h2>
            <div className="glass-card rounded-3xl p-10 max-w-3xl mx-auto">
              <HiShieldCheck className="w-16 h-16 text-green-400 mx-auto mb-6" />
              <p className="text-xl text-gray-300">Conversations are private and not sold, shared, or used for advertising.</p>
              <div className="grid grid-cols-3 gap-6 mt-8 text-sm">
                {['No IP Tracking', 'No Device IDs', 'No Location Data'].map(item => (
                  <div key={item} className="flex items-center justify-center space-x-2 text-green-400 font-mono">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />{item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Crisis Banner */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            className="glass-card rounded-3xl p-10 text-center border-red-500/30 max-w-3xl mx-auto">
            <HiPhone className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Need Immediate Help?</h3>
            <p className="text-gray-400 mb-6">If you're in crisis, please reach out to professionals who can help right now.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/30">
                <p className="text-sm text-gray-400">Suicide & Crisis Lifeline</p>
                <p className="text-3xl font-black text-red-400">988</p>
              </div>
              <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/30">
                <p className="text-sm text-gray-400">Crisis Text Line</p>
                <p className="text-xl font-black text-red-400">Text HOME to 741741</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </motion.div>
  )
}
export default LandingPage
