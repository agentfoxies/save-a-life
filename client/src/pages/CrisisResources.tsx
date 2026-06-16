import { motion } from 'framer-motion'
import { HiPhone, HiGlobeAlt, HiHeart } from 'react-icons/hi2'
import Footer from '../components/Footer'

const CrisisResources = () => {
  const resources = [
    {
      country: 'United States',
      hotline: '988',
      name: 'National Suicide Prevention Lifeline',
      text: 'Text HOME to 741741',
      website: 'https://988lifeline.org'
    },
    {
      country: 'United Kingdom',
      hotline: '111',
      name: 'NHS Emergency',
      text: 'Text SHOUT to 85258',
      website: 'https://www.nhs.uk'
    },
    {
      country: 'Canada',
      hotline: '1-833-456-4566',
      name: 'Crisis Services Canada',
      text: 'Text 45645',
      website: 'https://talksuicide.ca'
    },
    {
      country: 'Australia',
      hotline: '13 11 14',
      name: 'Lifeline Australia',
      text: 'Text 0477 13 11 14',
      website: 'https://www.lifeline.org.au'
    },
    {
      country: 'International',
      hotline: 'Varies by country',
      name: 'Befrienders Worldwide',
      text: 'Visit website',
      website: 'https://www.befrienders.org'
    }
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-20">
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-16">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiHeart className="w-14 h-14 text-red-500" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">Crisis Resources</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            If you or someone you know needs immediate crisis support, please use these resources.
            Help is available 24/7.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {resources.map((resource, index) => (
            <motion.div
              key={resource.country}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <HiGlobeAlt className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{resource.country}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{resource.name}</p>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <HiPhone className="w-4 h-4 text-green-600" />
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">{resource.hotline}</span>
                    </div>
                    <p className="text-sm text-gray-500">{resource.text}</p>
                    <a href={resource.website} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                      Visit Website →
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="max-w-2xl mx-auto mt-12 text-center glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Remember</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            You are not alone. There are people who care about you and want to help.
            Reaching out is a sign of strength, not weakness.
          </p>
        </motion.div>
      </div>
      <Footer />
    </motion.div>
  )
}

export default CrisisResources
