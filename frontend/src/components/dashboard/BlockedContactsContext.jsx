import react, { createContext, useContext, useState} from "react";

const BlockedContactsContext = createContext();

export function BlockedContactsProvider({ children }) {
    const [BlockedContacts, setBlockedContacts] = useState([]);

    return (
        <BlockedContactsContext.Provider value ={{BlockedContacts, setBlockedContacts}}>
            {children}
        </BlockedContactsContext.Provider>
    );
}

export function useBlockedContacts() {
    return useContext(BlockedContactsContext);
}