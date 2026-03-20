'use client'

import { useContext } from 'react'
import { DataContext, type DataContextType } from './data-provider'

export function useData(): DataContextType {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
