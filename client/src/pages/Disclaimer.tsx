import { motion } from 'framer-motion'
import { HiExclamationTriangle, HiHeart } from 'react-icons/hi2'
import Footer from '../components/Footer'

const Disclaimer = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-20">
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto mb-6">
              <img src="/logo.png" alt="Save A Life" className="w-20 h-20 rounded-full object-cover shadow-lg" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Important Disclaimer</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Please read this carefully before using our service</p>
          </div>

          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-8 mb-8">
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r-xl">
                <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-300 mb-4">What We Are</h2>
                <p className="text-blue-700 dark:text-blue-200">
                  Save A Life is a <strong>peer-support safe space</strong>. We're here to listen, support, 
                  and provide a comforting presence for anyone going through a tough time, feeling lonely, 
                  stressed, anxious, or just needing someone to talk to.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">We Provide:</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start space-x-2">
                    <HiHeart className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0" />
                    <span>A listening ear for whatever is on your mind</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <HiHeart className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0" />
                    <span>Emotional support during difficult moments</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <HiHeart className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0" />
                    <span>A safe, anonymous space to express yourself freely</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-6 rounded-r-xl">
                <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mb-4">What We Are NOT</h2>
                <ul className="space-y-2 text-yellow-700 dark:text-yellow-200">
                  <li>• Licensed therapists or mental health professionals</li>
                  <li>• A replacement for professional medical treatment</li>
                  <li>• A crisis hotline or emergency service</li>
                  <li>• Professional counseling or therapy</li>
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <HiExclamationTriangle className="w-6 h-6 text-red-600" />
                  <h3 className="text-xl font-bold text-red-800 dark:text-red-300">If You're in Crisis</h3>
                </div>
                <p className="text-red-700 dark:text-red-200">
                  If you're having thoughts of self-harm or suicide, please reach out immediately:
                </p>
                <ul className="mt-3 space-y-2 text-red-700 dark:text-red-200">
                  <li><strong>🇦🇪 UAE: 800-4673 (Mental Health) • 999 (Police) • 998 (Ambulance)
                        <br />US: 988 Suicide 988 Suicide & Crisis Lifeline Crisis Lifeline:</strong> Call or text 988</li>
                  <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
                  <li><strong>Emergency Services:</strong> Call 911</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              By using Save A Life, you acknowledge that you understand this disclaimer. 
              We're here for you, but we're not a substitute for professional care.
            </p>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </motion.div>
  )
}

export default Disclaimer
