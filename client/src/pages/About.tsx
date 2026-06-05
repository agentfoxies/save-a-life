import { motion } from 'framer-motion'
import { HiHeart, HiLightBulb, HiShieldCheck } from 'react-icons/hi2'
import Footer from '../components/Footer'

const About = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-20">
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-16">
          <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiHeart className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">About Save A Life</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Founded by <strong className="text-primary-600 dark:text-primary-400">Malak K</strong>
          </p>
        </motion.div>

        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-8 max-w-4xl mx-auto mb-12">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <HiLightBulb className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                To provide a safe place where people can speak openly, seek support, and find hope.
                We believe that every life has value and that everyone deserves to be heard,
                understood, and supported during their darkest moments.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-8">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
              <HiShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <blockquote className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              "Life is a gift with purpose — it is meant to be lived, cherished, and protected."
            </blockquote>
            <cite className="text-gray-600 dark:text-gray-400">— Save A Life</cite>
          </motion.div>

          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}
            className="glass-card rounded-2xl p-8">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-4">
              <HiHeart className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <blockquote className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              "You matter. Your life matters."
            </blockquote>
            <cite className="text-gray-600 dark:text-gray-400">— Save A Life</cite>
          </motion.div>
        </div>

        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
          className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Compassion', description: 'We approach every person with empathy, understanding, and genuine care.' },
              { title: 'Privacy', description: 'Your conversations are confidential and protected. We never share your data.' },
              { title: 'Hope', description: 'We believe in the power of human connection to bring light to dark moments.' },
            ].map((value, index) => (
              <motion.div key={value.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.2 }} className="glass-card rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      <Footer />
    </motion.div>
  )
}

export default About
