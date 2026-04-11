import { useEffect, useState } from 'react'

import { getExampleItems, getHealthStatus } from '../service'
import { normalizeApiError, type ApiError } from '../service/core/errors'

type ExampleItem = {
  id: string
  label: string
}

type ExampleState = {
  items: ExampleItem[]
  healthStatus: string
  error: ApiError | null
  isLoading: boolean
}

export function useExampleState() {
  const [state, setState] = useState<ExampleState>({
    items: [],
    healthStatus: 'loading',
    error: null,
    isLoading: true
  })

  useEffect(() => {
    async function load() {
      try {
        const [items, health] = await Promise.all([
          getExampleItems(),
          getHealthStatus()
        ])

        setState({
          items,
          healthStatus: health.status,
          error: null,
          isLoading: false
        })
      } catch (error) {
        setState({
          items: [],
          healthStatus: 'error',
          error: normalizeApiError(error),
          isLoading: false
        })
      }
    }

    void load()
  }, [])

  return state
}
