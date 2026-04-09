import { getJson } from '../core/client'

type ExampleItem = {
  id: string
  label: string
}

type ExampleResponse = {
  items: ExampleItem[]
}

export async function getExampleItems() {
  const result = await getJson<ExampleResponse>('/example')

  return result.items
}
