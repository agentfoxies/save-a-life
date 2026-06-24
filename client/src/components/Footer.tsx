import { Link } from 'react-router-dom'
import { HiShieldCheck, HiLockClosed, HiGlobeAlt } from 'react-icons/hi2'

const Footer = () => {
  return (
    <footer className="border-t border-gray-800 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/logo.png" alt="Save A Life" className="w-8 h-8 rounded-full" />
              <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Save A Life</span>
            </div>
            <p className="text-sm text-gray-500">A safe space for anyone who needs someone to talk to. Free, anonymous, always.</p>
            <div className="flex space-x-3 mt-4">
              <HiShieldCheck className="w-5 h-5 text-green-500" title="Verified" />
              <HiLockClosed className="w-5 h-5 text-green-500" title="Encrypted" />
              <HiGlobeAlt className="w-5 h-5 text-green-500" title="Global" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-purple-400 transition-colors">About Us</Link></li>
              <li><Link to="/disclaimer" className="hover:text-purple-400 transition-colors">Disclaimer</Link></li>
              <li><Link to="/join" className="hover:text-purple-400 transition-colors">Start Chatting</Link></li>
              <li><Link to="/resources" className="hover:text-purple-400 transition-colors">Crisis Resources</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Crisis Help</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><strong className="text-red-400">988</strong> - Suicide Lifeline</li>
              <li><strong className="text-red-400">741741</strong> - Crisis Text</li>
              <li><strong className="text-red-400">911</strong> - Emergency</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Trust & Safety</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center space-x-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> No tracking</li>
              <li className="flex items-center space-x-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Anonymous</li>
              <li className="flex items-center space-x-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Encrypted</li>
              <li className="flex items-center space-x-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Free forever</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Save A Life. All rights reserved.</p>
          <p className="text-xs text-gray-600 mt-1">Founded by <span className="text-purple-400">Malak K</span> • Built by <span className="text-blue-400">Malek Mostafa</span></p>
        </div>
      </div>
    </footer>
  )
}
export default Footer
