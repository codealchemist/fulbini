import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

interface SettingsValue {
  showPlayerPhotos: boolean
  setShowPlayerPhotos: (value: boolean) => void
  toggleShowPlayerPhotos: () => void
}

const STORAGE_KEY = 'fulbini.showPlayerPhotos'

const SettingsContext = createContext<SettingsValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [showPlayerPhotos, setShowPlayerPhotos] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(showPlayerPhotos))
    } catch {
      // ignore storage failures (e.g. private browsing)
    }
  }, [showPlayerPhotos])

  const value = useMemo<SettingsValue>(
    () => ({
      showPlayerPhotos,
      setShowPlayerPhotos,
      toggleShowPlayerPhotos: () => setShowPlayerPhotos((v) => !v),
    }),
    [showPlayerPhotos],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
