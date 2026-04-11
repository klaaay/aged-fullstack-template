import { templateDescription, templateDisplayName } from '@aged-template/meta'

import { PageHeader } from '../components/app'
import { ExamplePanel } from '../components/example'
import { SectionCard } from '../components/ui/SectionCard'
import { useExampleState } from '../hooks/use-example-state'

export function ExamplePage() {
  const { items, healthStatus, error, isLoading } = useExampleState()

  return (
    <>
      <PageHeader title={templateDisplayName} description={templateDescription} />
      <ExamplePanel items={items} />
      <SectionCard title="服务状态">
        {isLoading && <p>正在检测 API...</p>}
        {!isLoading && error && <p>请求失败：{error.message}</p>}
        {!isLoading && !error && <p>后端健康状态：{healthStatus}</p>}
      </SectionCard>
    </>
  )
}
