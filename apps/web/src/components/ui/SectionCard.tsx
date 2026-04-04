import type { PropsWithChildren } from 'react'

type SectionCardProps = PropsWithChildren<{
  title: string
}>

export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <section className="section-card">
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  )
}
