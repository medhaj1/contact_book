// frontend/src/components/dashboard/BlockedContactsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBlockedContacts, blockContact, unblockContact } from '../../services/blockedContactsService';

const BlockedContactsContext = createContext();

export const BlockedContactsProvider = ({ children, currentUser }) => {
    const [blockedContacts, setBlockedContacts] = useState([]);
  
    useEffect(() => {
      async function fetchBlocked() {
        if (!currentUser?.id) return; // wait for user
        const result = await getBlockedContacts(currentUser.id);
        if (result.success) {
          setBlockedContacts(result.data);
        } else {
          console.error('Failed to fetch blocked contacts:', result.error);
          setBlockedContacts([]); // fallback to empty array
        }
      }
      fetchBlocked();
    }, [currentUser]); // re-fetch whenever user changes
  
    const block = async (id) => {
      const result = await blockContact(id, currentUser.id);
      if (result.success) {
        // For new blocks, we might not have the contact details immediately
        // The list will be refreshed on next load or we could fetch the contact details
        setBlockedContacts(prev => [...prev, { contact_id: id, name: 'Loading...', email: '' }]);
      }
      return result;
    };
  
    const unblock = async (id) => {
      const result = await unblockContact(id, currentUser.id);
      if (result.success) {
        setBlockedContacts(prev => prev.filter(contact => contact.contact_id !== id));
      }
      return result;
    };
  
    return (
      <BlockedContactsContext.Provider value={{ blockedContacts, setBlockedContacts, block, unblock }}>
        {children}
      </BlockedContactsContext.Provider>
    );
  };

export const useBlockedContacts = () => useContext(BlockedContactsContext);