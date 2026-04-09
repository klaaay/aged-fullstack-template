import { ExampleProvider } from './contexts/ExampleContext'
import { AppLayout } from './layouts'
import { ExamplePage } from './pages'

export default function App() {
  return (
    <ExampleProvider>
      <AppLayout>
        <ExamplePage />
      </AppLayout>
    </ExampleProvider>
  )
}
