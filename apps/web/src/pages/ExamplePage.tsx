import { PageHeader } from '../components/app'
import { ExamplePanel } from '../components/example'
import { SectionCard } from '../components/ui/SectionCard'
import { useExampleContext } from '../contexts/ExampleContext'
import { useExampleState } from '../hooks/use-example-state'

export function ExamplePage() {
  const { title, description } = useExampleContext()
  const { items, healthStatus, errorMessage, isLoading } = useExampleState()

  return (
    <>
      <PageHeader title={title} description={description} />
      <ExamplePanel items={items} />
      <SectionCard title="服务状态">
        {isLoading && <p>正在检测 API...</p>}
        {!isLoading && errorMessage && <p>请求失败：{errorMessage}</p>}
        {!isLoading && !errorMessage && <p>后端健康状态：{healthStatus}</p>}
      </SectionCard>
    </>
  )
}
