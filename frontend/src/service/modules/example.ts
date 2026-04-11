import { apiClient } from '../core/client'

type ExampleItem = {
  id: string
  label: string
}

type ExampleResponse = {
  items: ExampleItem[]
}

export async function getExampleItems() {
  const response = await apiClient.get<ExampleResponse>('/example')
  return response.data.items
}
