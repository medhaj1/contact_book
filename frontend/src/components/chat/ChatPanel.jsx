import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';

function isOnline(lastSeen) {
  if (!lastSeen) return false;
  return (new Date() - new Date(lastSeen)) < 30 * 1000;
}

function ChatPanel({ currentUser, messages: initialMessages = [], onSend, onSendDocument }) {
  // Multi-select state for sent messages
  const [selectMode, setSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  
  // Delete selected messages
  const handleDeleteSelected = async () => {
    // Only keep valid string IDs
    const validIds = selectedMessages.filter(id => typeof id === 'string' && id && id !== 'undefined');
    if (validIds.length === 0) return;
    const { error } = await supabase.from('messages').delete().in('id', validIds);
    if (!error) {
      setMessages((prev) => prev.filter((m) => !validIds.includes(m.id)));
      setSelectedMessages([]);
      setSelectMode(false);
    } else {
      alert('Failed to delete messages: ' + error.message);
    }
  };

  const currentUserId = currentUser?.id;

  // Contact and invite logic
  const [inviteContacts, setInviteContacts] = useState([]);
  useEffect(() => {
    if (!currentUserId) return;
    const fetchInviteContacts = async () => {
      const { data: contacts } = await supabase
        .from('contact')
        .select('*')
        .eq('user_id', currentUserId)
        .not('email', 'is', null);
      if (!contacts?.length) {
        setInviteContacts([]);
        return;
      }

      const { data: profiles } = await supabase
        .from('user_profile')
        .select('email');
      const registeredEmails = profiles?.map(p => p.email) || [];
      const notRegistered = contacts.filter(c => !registeredEmails.includes(c.email));
      setInviteContacts(notRegistered);
    };
    fetchInviteContacts();
  }, [currentUserId]);


  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(() => {
    const saved = localStorage.getItem('chatPanelSelectedContact');
    return saved ? JSON.parse(saved) : null;
  });
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState(() => {
    return localStorage.getItem('chatPanelNewMessage') || '';
  });
  const [imageErrors, setImageErrors] = useState(new Set());
  const chatEndRef = useRef();
  const fileInputRef = useRef(null);

  // Fetch contacts
  useEffect(() => {
    if (!currentUserId) return;
    const fetchContacts = async () => {
      try {
        const { data: contacts } = await supabase
          .from('contact')
          .select('*')
          .eq('user_id', currentUserId)
          .not('email', 'is', null);
        if (!contacts?.length) {
          setContacts([]);
          return;
        }
        const emails = contacts.map(c => c.email);
        const { data: profiles } = await supabase
          .from('user_profile')
          .select('*')
          .in('email', emails);
        const chatContacts = contacts.map(contact => {
          const profile = profiles?.find(p => p.email === contact.email);
          return profile ? {
            ...contact,
            contact_user_id: profile.u_id,
            user_profile: profile
          } : null;
        }).filter(Boolean);
        setContacts(chatContacts);
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setContacts([]);
      }
    };
    fetchContacts();
  }, [currentUserId]);

  // Persist selected contact and new message input
  useEffect(() => {
    if (selectedContact) {
      localStorage.setItem('chatPanelSelectedContact', JSON.stringify(selectedContact));
    } else {
      localStorage.removeItem('chatPanelSelectedContact');
    }
  }, [selectedContact]);

  useEffect(() => {
    localStorage.setItem('chatPanelNewMessage', newMessage);
  }, [newMessage]);

  // Restore selected contact from contacts list after contacts are loaded
  useEffect(() => {
    if (contacts.length > 0 && !selectedContact) {
      const savedContact = localStorage.getItem('chatPanelSelectedContact');
      if (savedContact) {
        try {
          const parsedContact = JSON.parse(savedContact);
          // Find the contact in the current contacts list to ensure it's still valid
          const foundContact = contacts.find(c => 
            c.contact_user_id === parsedContact.contact_user_id || 
            c.contact_id === parsedContact.contact_id
          );
          if (foundContact) {
            setSelectedContact(foundContact);
          } else {
            // Contact no longer exists, clear the saved state
            localStorage.removeItem('chatPanelSelectedContact');
          }
        } catch (error) {
          console.error('Error parsing saved contact:', error);
          localStorage.removeItem('chatPanelSelectedContact');
        }
      }
    }
  }, [contacts, selectedContact]);

  // Fetch message history and mark received messages as seen
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
      const unseenIds = (data || [])
        .filter(m => m.receiver_id === currentUserId && !m.seen)
        .map(m => m.id);
      if (unseenIds.length > 0) {
        await supabase
          .from('messages')
          .update({ seen: true })
          .in('id', unseenIds);
        const { data: updatedData } = await supabase
          .from('messages')
          .select('*')
          .or(
            `and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedContact.contact_user_id}),and(sender_id.eq.${selectedContact.contact_user_id},receiver_id.eq.${currentUserId})`
          )
          .order('timestamp', { ascending: true });
        setMessages(updatedData || []);
      }
    };
    fetchMessages();
  }, [selectedContact, currentUserId]);

  // Reliable real-time subscription for chat
  useEffect(() => {
    if (!currentUserId || !selectedContact) return;
    // Unique channel name per chat
    const channelName = `chat_${currentUserId}_${selectedContact.contact_user_id}`;
    const sub = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const message = payload.new;
          const isRelevant =
            (message.sender_id === currentUserId && message.receiver_id === selectedContact.contact_user_id) ||
            (message.sender_id === selectedContact.contact_user_id && message.receiver_id === currentUserId);
          if (isRelevant) {
            setMessages(prev => {
              if (prev.some(m => m.id === message.id)) return prev;
              return [...prev, message];
            });
          }
          if (isRelevant && message.content.startsWith('[file]')) {
            const [, rest] = message.content.split('[file]');
            const [fileName, fileUrl] = rest.split('|');
            await supabase.from('shared_documents').insert({
              user_id: currentUserId,
              file_name: fileName,
              file_url: fileUrl,
              uploaded_at: new Date().toISOString(),
              sender_id: message.sender_id,
              receiver_id: message.receiver_id,
              message_id: message.id,
            });
          }
        }
      )
      .subscribe();


    // Cleanup previous subscription when contact changes
    return () => {
      if (sub) supabase.removeChannel(sub);
    };
  }, [currentUserId, selectedContact]);

  // Update online status every 2 seconds
  useEffect(() => {
    if (!currentUserId) return;
    const updateStatus = async () => {
      await supabase
        .from('user_profile')
        .update({ last_seen: new Date().toISOString() })
        .eq('u_id', currentUserId);
    };
    updateStatus();
    const interval = setInterval(updateStatus, 2000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedContact]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !selectedContact) return;
    const msg = {
      sender_id: currentUserId,
      receiver_id: selectedContact.contact_user_id,
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('messages').insert(msg).select();
    if (!error && data && data.length > 0) {
      // Use backend-generated message (with valid id)
      setMessages(prev => [...prev, data[0]]);
      setNewMessage('');
      localStorage.removeItem('chatPanelNewMessage');
    } else {
      console.error("Failed to send message:", error?.message);
    }
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleImageError = (contactId, e) => {
    if (imageErrors.has(contactId)) return;
    setImageErrors(prev => new Set([...prev, contactId]));
    e.target.style.display = 'none';
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedContact) return;
    const filePath = `chat/${currentUserId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('chat').upload(filePath, file);
    if (error) {
      alert('File upload failed: ' + error.message);
      return;
    }
    const { data: publicUrlData } = supabase.storage.from('chat').getPublicUrl(filePath);
    const fileUrl = publicUrlData?.publicUrl;
    if (!fileUrl) {
      alert('Could not get file URL');
      return;
    }
    const msg = {
      sender_id: currentUserId,
      receiver_id: selectedContact.contact_user_id,
      content: `[file]${file.name}|${fileUrl}`,
      timestamp: new Date().toISOString(),
    };
    const { error: insertError, data: insertedMessages } = await supabase.from('messages').insert(msg).select();
    if (!insertError) {
      setMessages(prev => [...prev, msg]);
      let messageId = insertedMessages?.[0]?.id;
      await supabase.from('shared_documents').insert({
        user_id: currentUserId,
        file_name: file.name,
        file_url: fileUrl,
        uploaded_at: new Date().toISOString(),
        sender_id: currentUserId,
        receiver_id: selectedContact.contact_user_id,
        message_id: messageId,
      });
      await supabase.from('shared_documents').insert({
        user_id: selectedContact.contact_user_id,
        file_name: file.name,
        file_url: fileUrl,
        uploaded_at: new Date().toISOString(),
        sender_id: currentUserId,
        receiver_id: selectedContact.contact_user_id,
        message_id: messageId,
      });
    } else {
      alert('Failed to send file: ' + insertError.message);
    }
    e.target.value = '';
  };

  return (
    <div className="flex w-full h-[500px] bg-white rounded-lg shadow-lg overflow-hidden min-h-[440px]">
      {/* Contact List */}
      <div className="w-96 bg-blue-50 border-r border-blue-200 p-4 overflow-y-auto">
        <h3 className="font-semibold text-lg mb-3 text-blue-800">Chats</h3>
        <ul>
          {contacts.map((c) => (
            <li
              key={c.contact_user_id}
              className={`flex gap-4 items-center p-2 rounded-lg mb-1 cursor-pointer hover:bg-blue-100 ${
                selectedContact?.contact_user_id === c.contact_user_id ? 'bg-blue-200' : ''
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
              <span
                className={`w-3 h-3 rounded-full ${
                  isOnline(c.user_profile?.last_seen) ? 'bg-green-500' : 'bg-slate-400'
                }`}
                title={isOnline(c.user_profile?.last_seen) ? 'Online' : 'Offline'}
              />
            </li>
          ))}
        </ul>
        {/* Invite Users Section - Chat List Style */}
        <div className="mt-8">
          <h4 className="font-semibold text-md mb-2 text-blue-800">Invite Users</h4>
          {inviteContacts.length === 0 ? (
            <div className="text-slate-400 text-sm">No users to invite.</div>
          ) : (
            <ul>
              {inviteContacts.map((c) => (
                <li
                  key={c.contact_id}
                  className="flex items-center p-2 rounded-lg mb-1 cursor-pointer hover:bg-blue-100"
                >
                  <div className="relative mr-3">
                    <div className="w-10 h-10 rounded-full bg-blue-200 border border-sky-200 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {(c.name || c.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-blue-900 truncate w-full">{c.name}</div>
                    <a
                      href={`mailto:${c.email}`}
                      className="text-xs text-blue-600 underline truncate w-full hover:text-blue-800"
                      title={`Send email to ${c.email}`}
                    >
                      {c.email}
                    </a>
                  </div>
                  <div className="flex-shrink-0 flex items-center justify-end" style={{ minWidth: '80px' }}>
                    <a
                      href={`mailto:${c.email}?subject=Contact%20Book%20Invite&body=Hi,%0A%0AI'd%20like%20to%20invite%20you%20to%20join%20the%20Contact%20Book%20app.%20Please%20sign%20up%20to%20connect%20with%20me!%0A%0AThanks!`}
                      className="w-[70px] px-0 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow text-center flex items-center justify-center"
                      title={`Send invite via email to ${c.email}`}
                    >
                      Invite
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-[2] flex flex-col h-full min-w-0">
        {selectedContact ? (
          <>
            {/* Chat Header */}
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
                <div className="text-blue-900 font-bold">
                  {selectedContact.user_profile?.name || selectedContact.name}
                </div>
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
              {/* Removed selection controls (Cancel Selection and Delete Selected buttons) */}
              {messages.length === 0 ? (
                <div className="text-slate-500 py-24 text-center">No messages yet.</div>
              ) : (
                messages.map((m) => {
                  // Message rendering
                  let isFile = false, fileName = '', fileUrl = '';
                  if (m.content.startsWith('[file]')) {
                    isFile = true;
                    const [, rest] = m.content.split('[file]');
                    [fileName, fileUrl] = rest.split('|');
                  }
                  const messageKey = m.id ? m.id : m.timestamp;
                  const handleDeleteMessage = async (id) => {
                    const { error } = await supabase.from('messages').delete().eq('id', id);
                    if (!error) {
                      setMessages((prev) => prev.filter((msg) => msg.id !== id));
                    } else {
                      alert('Failed to delete message: ' + error.message);
                    }
                  };
                  return (
                    <div
                      key={messageKey}
                      className={`flex ${m.sender_id === currentUserId ? 'justify-end' : 'justify-start'} mb-1`}
                    >
                      <div
                        className={`rounded-xl px-4 py-2 max-w-[72%] text-sm whitespace-pre-line relative ${
                          m.sender_id === currentUserId
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-slate-200'
                        }`}
                      >
                        {isFile ? (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline break-all"
                            download={fileName}
                          >
                            📎 {fileName}
                          </a>
                        ) : (
                          m.content
                        )}
                        {/* Three-dot menu for sent messages */}
                        {m.sender_id === currentUserId && (
                          <div className="absolute top-2 right-2">
                            <button
                              type="button"
                              className="text-white bg-transparent hover:text-slate-300 text-lg px-1"
                              onClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                              aria-label="Message options"
                            >
                              &#8942;
                            </button>
                            {openMenuId === m.id && (
                              <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg z-10">
                                <button
                                  className="block px-4 py-2 text-red-600 hover:bg-red-100 w-full text-left"
                                  onClick={() => { handleDeleteMessage(m.id); setOpenMenuId(null); }}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-end gap-1 text-xs text-right text-slate-300 mt-1">
                          <span>{new Date(m.timestamp).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}</span>
                          {m.sender_id === currentUserId && (
                            <span title={m.seen ? 'Seen' : 'Sent'} className="ml-1 flex items-center">
                              {m.seen ? (
                                <span className="flex items-center">
                                  {/* Double tick SVG */}
                                  <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                                    <path d="M5 9.5L8 12.5L13 7.5" stroke="#e3f706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  <svg width="15" height="15" viewBox="0 0 18 18" fill="none" style={{marginLeft: '-4px'}}>
                                    <path d="M9 9.5L12 12.5L17 7.5" stroke="#e3f706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </span>
                              ) : (
                                <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                                  <path d="M5 9.5L8 12.5L13 7.5" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* New message input and file upload */}
            <form className="flex gap-2 border-t p-3 bg-blue-100" onSubmit={sendMessage}>
              <input
                className="flex-1 rounded-lg px-4 py-2 border border-blue-300 outline-none text-blue-800"
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                autoComplete="off"
              />
              <input 
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button
                type="button"
                className="bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700"
                onClick={() => fileInputRef.current?.click()}
                title="Upload file"
              >
                📎
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 font-semibold"
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
}
export default ChatPanel;
