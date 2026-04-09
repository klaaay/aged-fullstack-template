import { createContext, type PropsWithChildren, useContext } from 'react'

type ExampleContextValue = {
  title: string
  description: string
}

const ExampleContext = createContext<ExampleContextValue | null>(null)

export function ExampleProvider({ children }: PropsWithChildren) {
  return (
    <ExampleContext.Provider
      value={{
        title: 'aged-fullstack-template',
        description: '面向 aged-* 业务项目的全栈模板。'
      }}
    >
      {children}
    </ExampleContext.Provider>
  )
}

export function useExampleContext() {
  const value = useContext(ExampleContext)

  if (!value) {
    throw new Error('useExampleContext must be used within ExampleProvider')
  }

  return value
}
