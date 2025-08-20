import { useState, useCallback } from 'react'

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function useApi<T = any>(options: UseApiOptions = {}) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (
    url: string, 
    config: RequestInit = {}
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        ...config,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
      
      if (options.onSuccess) {
        options.onSuccess(result)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      
      if (options.onError) {
        options.onError(errorMessage)
      }

      return null
    } finally {
      setLoading(false)
    }
  }, [options])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}