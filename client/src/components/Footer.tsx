import { Link } from 'react-router-dom'
import { HiHeart } from 'react-icons/hi2'

const Footer = () => {
  return (
    <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/logo.png" alt="Save A Life" className="w-6 h-6 rounded-full object-cover" />
              <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                Save A Life
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Anonymous support and suicide prevention platform. You matter. Your life matters.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">About Us</Link></li>
              <li><Link to="/disclaimer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">Disclaimer</Link></li>
              <li><Link to="/join" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">Join Chat</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Crisis Resources</h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-600 dark:text-gray-400">Suicide Prevention Lifeline: <strong>988</strong></li>
              <li className="text-sm text-gray-600 dark:text-gray-400">Crisis Text Line: Text <strong>HOME</strong> to 741741</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            © {new Date().getFullYear()} Save A Life. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Founded by <span className="font-medium text-primary-600 dark:text-primary-400">Malak K</span> • Co-Founder & Developer <span className="font-medium text-teal-600 dark:text-teal-400">Malek Mostafa</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
