'use client'

import { createContext, useContext, useState } from 'react';

const ContentLoadingContext = createContext(null)

export function ContentLoadingProvider({ children }) {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <ContentLoadingContext.Provider value={{ isLoading, setIsLoading }}>
            {children}
        </ContentLoadingContext.Provider>
    )
}

export function useContentLoader() {
    const ctx = useContext(ContentLoadingContext)
    if (!ctx) throw new Error('useFilter must be used within FilterProvider')
    return ctx;
}