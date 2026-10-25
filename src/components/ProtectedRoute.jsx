import { useSyncExternalStore } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getSession } from '../utils/session'

function getSnapshot() {
  return getSession()?.token || null
}

function subscribe(onChange) {
  let timer
  const update = () => {
    clearTimeout(timer)
    onChange()
    const session = getSession()
    if (session) {
      // Long-lived tokens need multiple timers to avoid the browser's 32-bit limit.
      timer = setTimeout(update, Math.min(session.expiresAt - Date.now(), 2147483647))
    }
  }
  const onStorage = (event) => {
    if (event.key === 'token' || event.key === null) update()
  }
  window.addEventListener('session-changed', update)
  window.addEventListener('storage', onStorage)
  update()
  return () => {
    clearTimeout(timer)
    window.removeEventListener('session-changed', update)
    window.removeEventListener('storage', onStorage)
  }
}

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const token = useSyncExternalStore(subscribe, getSnapshot, () => null)
  return token ? children : <Navigate to="/" replace state={{ from: location.pathname }} />
}

export default ProtectedRoute
