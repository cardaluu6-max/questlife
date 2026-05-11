import { useState, useCallback } from 'react'

let id = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((type, title, sub) => {
    const tid = ++id
    setToasts(t => [...t, { id: tid, type, title, sub }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== tid)), 4000)
  }, [])

  const removeToast = useCallback((tid) => {
    setToasts(t => t.filter(x => x.id !== tid))
  }, [])

  return { toasts, addToast, removeToast }
}
