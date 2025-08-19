// frontend/src/components/dashboard/BlockedContactsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBlockedContacts, blockContact, unblockContact } from '../../services/blockedContactsService';

const BlockedContactsContext = createContext();

export const BlockedContactsProvider = ({ children, currentUser }) => {
    const [blockedContacts, setBlockedContacts] = useState([]);
  
    useEffect(() => {
      async function fetchBlocked() {
        if (!currentUser?.id) return; // wait for user
        const ids = await getBlockedContacts();
        setBlockedContacts(ids);
      }
      fetchBlocked();
    }, [currentUser]); // re-fetch whenever user changes
  
    const block = async (id) => {
      await blockContact(id);
      setBlockedContacts(prev => [...prev, id]);
    };
  
    const unblock = async (id) => {
      await unblockContact(id);
      setBlockedContacts(prev => prev.filter(cid => cid !== id));
    };
  
    return (
      <BlockedContactsContext.Provider value={{ blockedContacts, setBlockedContacts, block, unblock }}>
        {children}
      </BlockedContactsContext.Provider>
    );
  };

export const useBlockedContacts = () => useContext(BlockedContactsContext);