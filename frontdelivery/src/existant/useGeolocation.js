import { useState, useCallback } from 'react'

export function useGeolocation() {
  const [coords,  setCoords]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée par ce navigateur')
      return
    }
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude:  pos.coords.latitude,
          longitude: pos.coords.longitude,
        })
        setLoading(false)
      },
      (err) => {
        console.warn('[useGeolocation] GPS refusé ou indisponible:', err.message)
        setError(err.message)
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    )
  }, [])

  return { coords, loading, error, requestPosition }
}