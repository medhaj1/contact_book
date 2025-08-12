import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';

// Utility function to detect online status (within 30s)
function isOnline(lastSeen) {
  if (!lastSeen) return false;
  return (new Date() - new Date(lastSeen)) < 30 * 1000;
}

const ChatPanel = ({ currentUser }) => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [realtimeSub, setRealtimeSub] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());
  const chatEndRef = useRef();

  const currentUserId =currentUser.id;

  // 1. Fetch contacts who are users (simpler approach)
  useEffect(() => {
  if (!currentUserId) return;
  
  const fetchContacts = async () => {
    try {
      // Get contacts with emails
      const { data: contacts } = await supabase
        .from('contact')
        .select('*')
        .eq('user_id', currentUserId)
        .not('email', 'is', null);

      if (!contacts || contacts.length === 0) {
        setContacts([]);
        return;
      }

      // Get user profiles for these emails
      const emails = contacts.map(c => c.email);
      const { data: profiles } = await supabase
        .from('user_profile')
        .select('*')
        .in('email', emails);

      // Match contacts with profiles
      const chatContacts = contacts
        .map(contact => {
          const profile = profiles?.find(p => p.email === contact.email);
          if (profile) {
            return {
              ...contact,
              contact_user_id: profile.u_id,
              user_profile: profile
            };
          }
          return null;
        })
        .filter(Boolean);

      console.log('Chat contacts:', chatContacts);
      setContacts(chatContacts);

    } catch (err) {
      console.error('Error:', err);
      setContacts([]);
    }
  };
  
  fetchContacts();
}, [currentUserId]);


  // 2. Fetch message history with selected contact
  useEffect(() => {
    if (!selectedContact) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedContact.contact_user_id}),and(sender_id.eq.${selectedContact.contact_user_id},receiver_id.eq.${currentUserId})`
        )
        .order('timestamp', { ascending: true });
      setMessages(data || []);
    };
    fetchMessages();
  }, [selectedContact, currentUserId]);

  // 3. Realtime: Subscribe to new messages for current user
  useEffect(() => {
    if (!currentUserId) return;
    if (realtimeSub) return; // Prevent duplicate
    const sub = supabase
      .channel('chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}`,
        },
        (payload) => {
          // If we're currently chatting with the sender, update messages
          if (
            selectedContact &&
            payload.new.sender_id === selectedContact.contact_user_id
          ) {
            setMessages((msgs) => [...msgs, payload.new]);
          }
        }
      )
      .subscribe();
    setRealtimeSub(sub);
    return () => {
      if (realtimeSub) supabase.removeChannel(realtimeSub);
    };
    // Only on mount/unmount
    // eslint-disable-next-line
  }, [currentUserId, selectedContact]);

  // 4. Handle sending messages
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;
    await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: selectedContact.contact_user_id,
      content: newMessage.trim(),
    });
    setNewMessage('');
    // Also optimistically add to current message list
    setMessages((msgs) => [
      ...msgs,
      {
        sender_id: currentUserId,
        receiver_id: selectedContact.contact_user_id,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
      },
    ]);
    // Scroll to bottom
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // 5. Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedContact]);

  // 6. Update online status every 25 seconds
  useEffect(() => {
    if (!currentUserId) return;
    const ping = setInterval(() => {
      supabase
        .from('user_profile')
        .update({ last_seen: new Date().toISOString() })
        .eq('u_id', currentUserId);
    }, 25 * 1000);
    // Initial
    supabase
      .from('user_profile')
      .update({ last_seen: new Date().toISOString() })
      .eq('u_id', currentUserId);
    return () => clearInterval(ping);
  }, [currentUserId]);

  const handleImageError = (contactId, e) => {
    // Prevent infinite loop by checking if we already handled this error
    if (imageErrors.has(contactId)) return;
    
    setImageErrors(prev => new Set([...prev, contactId]));
    e.target.style.display = 'none'; // Hide the broken image
  };

  return (
    <div className="flex w-full h-[600px] bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-2xl shadow-lg overflow-hidden min-h-[440px]">
      {/* Contact List */}
      <div className="w-72 bg-blue-50 dark:bg-slate-900 border-r border-blue-200 dark:border-slate-700 p-4 overflow-y-auto">
        <h3 className="font-semibold text-lg mb-3 text-blue-800 dark:text-slate-400">Chats</h3>
        <ul>
          {contacts.map((c) => (
            <li
              key={c.contact_user_id}
              className={`flex gap-4 items-center p-2 rounded-lg mb-1 cursor-pointer hover:bg-blue-100 ${
                selectedContact?.contact_user_id === c.contact_user_id &&
                'bg-blue-200'
              }`}
              onClick={() => setSelectedContact(c)}
            >
              <div className="relative">
                {!imageErrors.has(c.contact_user_id) ? (
                  <img
                    className="w-10 h-10 rounded-full object-cover border border-sky-200"
                    src={c.user_profile?.image || '/user-placeholder.png'}
                    alt={c.user_profile?.name}
                    onError={(e) => handleImageError(c.contact_user_id, e)}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-200 border border-sky-200 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {(c.user_profile?.name || c.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-blue-900 truncate">
                  {c.user_profile?.name || c.name}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {c.user_profile?.email}
                </div>
              </div>
              {isOnline(c.user_profile?.last_seen) ? (
                <span className="w-3 h-3 rounded-full bg-green-500" title="Online"></span>
              ) : (
                <span className="w-3 h-3 rounded-full bg-slate-400"></span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* Chat area */}
      <div className="flex-1 flex flex-col h-full">
        {selectedContact ? (
          <>
            {/* Chat header */}
            <div className="flex gap-3 items-center border-b p-4 bg-blue-100 min-h-[70px]">
              <div className="relative">
                {!imageErrors.has(selectedContact.contact_user_id) ? (
                  <img
                    src={selectedContact.user_profile?.image || '/user-placeholder.png'}
                    alt={selectedContact.user_profile?.name}
                    className="w-12 h-12 rounded-full border border-sky-300 object-cover"
                    onError={(e) => handleImageError(selectedContact.contact_user_id, e)}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-200 border border-sky-300 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {(selectedContact.user_profile?.name || selectedContact.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <div className="text-blue-900 font-bold">{selectedContact.user_profile?.name || selectedContact.name}</div>
                <div className="text-xs text-slate-500">{selectedContact.user_profile?.email}</div>
                <div className="text-xs">
                  <span className={isOnline(selectedContact.user_profile?.last_seen) ? "text-green-500" : "text-slate-500"}>
                    {isOnline(selectedContact.user_profile?.last_seen) ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              {messages.length === 0 ? (
                <div className="text-slate-500 py-24 text-center">No messages yet.</div>
              ) : (
                messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      m.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                    } mb-1`}
                  >
                    <div
                      className={`rounded-xl px-4 py-2 max-w-[72%] text-sm whitespace-pre-line ${
                        m.sender_id === currentUserId
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-200'
                      }`}
                    >
                      {m.content}
                      <div className="text-xs text-right text-slate-300 mt-1">
                        {new Date(m.timestamp).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef}></div>
            </div>
            {/* Message Input */}
            <form
              onSubmit={sendMessage}
              className="border-t p-4 bg-blue-100 flex gap-2"
            >
              <input
                type="text"
                className="flex-1 px-4 py-2 rounded-lg border border-blue-200 outline-none text-slate-700"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                className="bg-blue-600 text-white rounded-lg px-5 py-2 font-semibold hover:bg-blue-700"
                type="submit"
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-slate-400">
            Select a contact to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;
