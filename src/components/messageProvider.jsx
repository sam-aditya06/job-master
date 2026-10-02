"use client";

import { createContext, useContext } from "react";

const MessageContext = createContext(null);

export function MessageProvider({ lang, messages, children }) {
    return (
        <MessageContext.Provider value={{ lang, messages }}>
            {children}
        </MessageContext.Provider>
    );
}

export function useMessages() {
    const context = useContext(MessageContext);

    if (!context) {
        throw new Error("useMessages must be used within a MessageProvider");
    }

    return context;
}