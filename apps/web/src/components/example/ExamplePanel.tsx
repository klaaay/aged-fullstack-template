import { SectionCard } from '../ui/SectionCard'

type ExampleItem = {
  id: string
  label: string
}

type ExamplePanelProps = {
  items: ExampleItem[]
}

export function ExamplePanel({ items }: ExamplePanelProps) {
  return (
    <SectionCard title="Example Items">
      <ul className="example-list">
        {items.map((item) => (
          <li key={item.id}>{item.label}</li>
        ))}
      </ul>
    </SectionCard>
  )
}
