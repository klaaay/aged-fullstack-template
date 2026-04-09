import { useEffect, useState } from 'react'
import { getExampleItems, getHealthStatus } from '../service'

type ExampleItem = {
  id: string
  label: string
}

type ExampleState = {
  items: ExampleItem[]
  healthStatus: string
  errorMessage: string | null
  isLoading: boolean
}

export function useExampleState() {
  const [state, setState] = useState<ExampleState>({
    items: [],
    healthStatus: 'loading',
    errorMessage: null,
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
          errorMessage: null,
          isLoading: false
        })
      } catch (error) {
        setState({
          items: [],
          healthStatus: 'error',
          errorMessage: error instanceof Error ? error.message : 'unknown error',
          isLoading: false
        })
      }
    }

    void load()
  }, [])

  return state
}
