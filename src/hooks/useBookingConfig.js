import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export const useBookingConfig = () => {
  const [config, setConfig] = useState({
    oneTwoMin: 600,
    threeSixMin: 1200,
    sevenTenMin: 2500,
  })

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await api.get('/api/config/booking')
        if (data && data.oneTwoMin !== undefined) {
          setConfig(data)
        }
      } catch (err) {
        console.warn('useBookingConfig: using fallback values', err)
      }
    }
    fetchConfig()
  }, [])

  return config
}
# force redeploy
