// context/filter-context.jsx
'use client'

import { createContext, useContext, useOptimistic, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const FilterContext = createContext(null)

export function FilterProvider({ children, initialParams = {} }) {
    const { page, ...requiredParams } = initialParams;
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [optimisticParams, setOptimisticParams] = useOptimistic(requiredParams)

    function applyFilter(newParams) {
        if (!newParams.page) {
            const merged = { ...optimisticParams, ...newParams };
            // Remove undefined/null/empty keys
            const cleaned = Object.fromEntries(
                Object.entries(merged).filter(([_, v]) => v != null && v !== '')
            )

            startTransition(() => {
                setOptimisticParams(cleaned)
                const qs = new URLSearchParams(cleaned).toString();
                router.replace(`?${qs}`)
            })
        }
    }

    function removeFilter(key) {
        const updated = { ...optimisticParams }
        delete updated[key]

        startTransition(() => {
            setOptimisticParams(updated)
            const qs = new URLSearchParams(updated).toString()
            router.replace(`?${qs}`)
        })
    }

    function clearFilters() {
        startTransition(() => {
            setOptimisticParams({})
            router.replace('?')
        })
    }

    return (
        <FilterContext.Provider value={{ optimisticParams, isPending, applyFilter, removeFilter, clearFilters }}>
            {children}
        </FilterContext.Provider>
    )
}

export function useFilter() {
    const ctx = useContext(FilterContext)
    if (!ctx) throw new Error('useFilter must be used within FilterProvider')
    return ctx
}