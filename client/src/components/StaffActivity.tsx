import { useState, useEffect } from 'react'

interface StaffStats {
  chatsHandled: number
  lastActive: string
  status: string
}

const StaffActivity = () => {
  const [stats, setStats] = useState<StaffStats>({
    chatsHandled: 0,
    lastActive: 'Just now',
    status: 'online'
  })

  useEffect(() => {
    // Track mouse movement for auto-away
    let timeout: ReturnType<typeof setTimeout>
    
    const resetTimer = () => {
      clearTimeout(timeout)
      const status = localStorage.getItem('staffStatus')
      if (status !== 'offline' && status !== 'busy') {
        localStorage.setItem('staffStatus', 'online')
      }
      localStorage.setItem('lastActive', new Date().toISOString())
      
      // Auto-away after 5 minutes of inactivity
      timeout = setTimeout(() => {
        const currentStatus = localStorage.getItem('staffStatus')
        if (currentStatus === 'online') {
          localStorage.setItem('staffStatus', 'away')
          window.dispatchEvent(new Event('staffStatusChange'))
        }
      }, 300000) // 5 minutes
    }

    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('keydown', resetTimer)
    window.addEventListener('click', resetTimer)
    resetTimer()

    // Load chats handled today
    const today = new Date().toDateString()
    const handled = parseInt(localStorage.getItem(`chatsHandled_${today}`) || '0')
    setStats(prev => ({ ...prev, chatsHandled: handled }))

    // Update last active display
    const updateDisplay = () => {
      const lastActive = localStorage.getItem('lastActive')
      if (lastActive) {
        const diff = Date.now() - new Date(lastActive).getTime()
        const minutes = Math.floor(diff / 60000)
        setStats(prev => ({
          ...prev,
          lastActive: minutes < 1 ? 'Just now' : minutes < 60 ? `${minutes}m ago` : `${Math.floor(minutes / 60)}h ago`,
          status: localStorage.getItem('staffStatus') || 'online'
        }))
      }
    }

    updateDisplay()
    const interval = setInterval(updateDisplay, 10000)
    
    window.addEventListener('staffStatusChange', updateDisplay)
    
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('keydown', resetTimer)
      window.removeEventListener('click', resetTimer)
    }
  }, [])

  const incrementChatsHandled = () => {
    const today = new Date().toDateString()
    const current = parseInt(localStorage.getItem(`chatsHandled_${today}`) || '0')
    const newCount = current + 1
    localStorage.setItem(`chatsHandled_${today}`, newCount.toString())
    setStats(prev => ({ ...prev, chatsHandled: newCount }))
  }

  // Expose increment function globally
  useEffect(() => {
    (window as any).incrementChatsHandled = incrementChatsHandled
  }, [])

  return (
    <div className="flex items-center space-x-4 text-sm">
      <div className="flex items-center space-x-2">
        <span className={`w-2 h-2 rounded-full ${
          stats.status === 'online' ? 'bg-green-500' :
          stats.status === 'busy' ? 'bg-yellow-500' :
          stats.status === 'away' ? 'bg-orange-500' : 'bg-gray-500'
        }`} />
        <span className="text-gray-600">{stats.status}</span>
      </div>
      <span className="text-gray-400">•</span>
      <span className="text-gray-500">Active: {stats.lastActive}</span>
      <span className="text-gray-400">•</span>
      <span className="text-gray-500">Chats today: {stats.chatsHandled}</span>
    </div>
  )
}

export default StaffActivity
