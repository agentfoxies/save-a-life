import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiShieldCheck, HiChatBubbleLeftRight, HiUserGroup } from 'react-icons/hi2'
import Footer from '../components/Footer'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
}

const LandingPage = () => {
  return (
    <motion.div initial="initial" animate="animate" exit={{ opacity: 0 }} className="pt-20">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-8">
            <motion.div variants={fadeInUp} className="flex justify-center">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}>
                <img src="/logo.png" alt="Save A Life" className="w-24 h-24 rounded-full object-cover shadow-xl mx-auto" />
              </motion.div>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl font-extrabold">
              <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">Save A Life</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-light">
              Anonymous Support Anonymous Support & Suicide Prevention Safe Space
            </motion.p>
            <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-8 max-w-2xl mx-auto">
              <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
                We are a non-profit organization dedicated to providing support, understanding, and a safe space for anyone facing emotional struggles, mental health challenges, or just need someone to talk to.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/mood">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary px-8 py-4 rounded-full text-lg font-semibold flex items-center justify-center space-x-2">
                  <HiChatBubbleLeftRight className="w-6 h-6" /><span>Talk to Someone</span>
                </motion.button>
              </Link>
              <motion.a href="#how-it-works" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-secondary px-8 py-4 rounded-full text-lg font-semibold">Learn More</motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Getting support is simple, anonymous, and completely free</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: HiUserGroup, title: '1. Join Anonymously', description: 'Enter a display name or use our anonymous name generator. Your identity is always protected.', color: 'from-blue-500 to-cyan-500' },
              { icon: HiChatBubbleLeftRight, title: '2. Connect Privately', description: 'Get connected to a private support room where you can speak freely with our support team.', color: 'from-indigo-500 to-purple-500' },
              { icon: HiShieldCheck, title: '3. Stay Safe', description: 'All conversations are private and encrypted. We never share, sell, or use your data for advertising.', color: 'from-teal-500 to-green-500' },
            ].map((step, index) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.2 }} whileHover={{ y: -10 }} className="glass-card rounded-2xl p-8 text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </motion.div>
  )
}

export default LandingPage
