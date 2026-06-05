import { motion } from 'framer-motion'
import { HiExclamationTriangle, HiShieldCheck } from 'react-icons/hi2'
import Footer from '../components/Footer'

const Disclaimer = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-20"
    >
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiExclamationTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Important Disclaimer
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Please read this carefully before using our service
            </p>
          </div>

          {/* Main Disclaimer */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-8 mb-8"
          >
            <div className="prose dark:prose-invert max-w-none">
              <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-xl">
                  <h2 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-4">
                    Important Notice
                  </h2>
                  <p className="text-red-700 dark:text-red-200 font-medium">
                    Save A Life is a peer-support service. We are not licensed therapists, 
                    psychologists, doctors, mental health professionals, or emergency responders.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    What We Are
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start space-x-2">
                      <HiShieldCheck className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>A supportive community of caring individuals</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <HiShieldCheck className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>A safe space for open conversation</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <HiShieldCheck className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>Anonymous peer support platform</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    What We Are NOT
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>A replacement for professional medical or mental health treatment</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>A crisis hotline or emergency service</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>Licensed therapy or counseling</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>A substitute for prescribed medication or treatment plans</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-3">
                    If You Are In Immediate Danger
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-200 font-medium">
                    Call emergency services (911 in the US) or a crisis hotline immediately:
                  </p>
                  <ul className="mt-3 space-y-2 text-yellow-700 dark:text-yellow-200">
                    <li>
                      <strong>National Suicide Prevention Lifeline:</strong> 988
                    </li>
                    <li>
                      <strong>Crisis Text Line:</strong> Text HOME to 741741
                    </li>
                    <li>
                      <strong>Emergency Services:</strong> 911
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Agreement Section */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              By using Save A Life, you acknowledge that you have read, understood, 
              and agree to this disclaimer. If you do not agree, please do not use this service.
            </p>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </motion.div>
  )
}

export default Disclaimer