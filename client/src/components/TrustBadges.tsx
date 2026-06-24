const TrustBadges = () => (
  <div className="flex flex-wrap justify-center gap-4 py-4">
    {[
      { icon: '🔒', text: 'End-to-End Encrypted' },
      { icon: '🛡️', text: 'No Data Collection' },
      { icon: '✅', text: 'Verified Non-Profit' },
      { icon: '🌍', text: 'Global Support' },
      { icon: '⏰', text: '24/7 Availability' },
    ].map(badge => (
      <div key={badge.text} className="flex items-center space-x-2 px-4 py-2 bg-green-500/5 border border-green-500/20 rounded-full text-sm text-green-400">
        <span>{badge.icon}</span>
        <span>{badge.text}</span>
      </div>
    ))}
  </div>
)
export default TrustBadges
