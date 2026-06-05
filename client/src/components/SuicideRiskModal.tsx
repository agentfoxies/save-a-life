import { motion, AnimatePresence } from 'framer-motion'
import { HiExclamationTriangle, HiXMark } from 'react-icons/hi2'

interface SuicideRiskModalProps {
  isOpen: boolean
  onClose: () => void
}

const SuicideRiskModal = ({ isOpen, onClose }: SuicideRiskModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <HiExclamationTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Your Safety Matters
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <HiXMark className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  If you are in immediate danger or considering self-harm, please reach out for help immediately.
                </p>
                
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                    Emergency Resources:
                  </h3>
                  <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
                    <li>• Call <strong>988</strong> - National Suicide Prevention Lifeline</li>
                    <li>• Text <strong>HOME</strong> to <strong>741741</strong> - Crisis Text Line</li>
                    <li>• Call <strong>911</strong> or your local emergency services</li>
                    <li>• Go to your nearest emergency room</li>
                  </ul>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Remember: You are not alone. There are people who care about you and want to help.
                  Professional support is available 24/7.
                </p>
                
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  I Understand, Continue Chatting
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SuicideRiskModal
