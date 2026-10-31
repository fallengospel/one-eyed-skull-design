import { createContext, useContext, useState, useEffect } from 'react'

const EditModeContext = createContext(null)
const KEY = 'oesd.editMode'

export function EditModeProvider({ children }) {
  const [editMode, setEditMode] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(KEY, editMode ? '1' : '0')
    } catch (e) {
      console.error('[EditMode] persist failed:', e)
    }
  }, [editMode])

  const toggleEditMode = () => setEditMode((v) => !v)

  return (
    <EditModeContext.Provider value={{ editMode, setEditMode, toggleEditMode }}>
      {children}
    </EditModeContext.Provider>
  )
}

export function useEditMode() {
  const ctx = useContext(EditModeContext)
  if (!ctx) throw new Error('useEditMode must be used within EditModeProvider')
  return ctx
}
