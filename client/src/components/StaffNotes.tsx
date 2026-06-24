import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiPlus, HiTrash, HiClipboardList } from 'react-icons/hi2'
import { format } from 'date-fns'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Note {
  _id: string; text: string; author: string; createdAt: string
}

const API_URL = 'https://save-a-life-api.onrender.com/api'

const StaffNotes = ({ roomId }: { roomId: string }) => {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadNotes = async () => {
    try {
      const res = await axios.get(`${API_URL}/conversations/${roomId}/notes`)
      setNotes(res.data || [])
    } catch {}
  }

  useEffect(() => {
    if (isOpen) loadNotes()
  }, [isOpen, roomId])

  const addNote = async () => {
    if (!newNote.trim()) return
    setLoading(true)
    try {
      const user = JSON.parse(localStorage.getItem('adminUser') || '{}')
      await axios.post(`${API_URL}/conversations/${roomId}/notes`, {
        text: newNote.trim(),
        author: user.username || 'Staff'
      })
      setNewNote('')
      loadNotes()
      toast.success('Note added')
    } catch { toast.error('Failed to add note') }
    setLoading(false)
  }

  const deleteNote = async (noteId: string) => {
    try {
      await axios.delete(`${API_URL}/conversations/${roomId}/notes/${noteId}`)
      loadNotes()
      toast.success('Note deleted')
    } catch { toast.error('Failed') }
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
          notes.length > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-600'
        }`}>
        <HiClipboardList className="w-4 h-4" />
        <span>Notes {notes.length > 0 && `(${notes.length})`}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-12 right-0 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 p-4 max-h-[500px] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">📝 Staff Notes</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-3 mb-4 max-h-[250px] overflow-y-auto">
              {notes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No notes yet. Add private notes visible to all staff.</p>
              ) : (
                notes.map((note) => (
                  <motion.div key={note._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3">
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-gray-800 dark:text-gray-200">{note.text}</p>
                      <button onClick={() => deleteNote(note._id)} className="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0">
                        <HiTrash className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs font-medium text-yellow-700">{note.author}</span>
                      <span className="text-xs text-gray-400">{format(new Date(note.createdAt), 'MMM d, h:mm a')}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addNote() }}
                placeholder="Add a private note..."
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={addNote}
                disabled={loading || !newNote.trim()}
                className="px-3 py-2 bg-yellow-500 text-white rounded-xl text-sm font-semibold hover:bg-yellow-600 disabled:opacity-50">
                <HiPlus className="w-4 h-4" />
              </motion.button>
            </div>
            <p className="text-xs text-gray-400 mt-2">These notes are visible to all staff members.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default StaffNotes
