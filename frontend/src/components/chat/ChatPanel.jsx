import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';

function isOnline(lastSeen) {
  if (!lastSeen) return false;
  return (new Date() - new Date(lastSeen)) < 30 * 1000;
}

function ChatPanel({ currentUser, messages: initialMessages = [], onSend, onSendDocument }) {
  const currentUserId = currentUser?.id;
  // Fetch contacts not registered (not in user_profile)
  const [inviteContacts, setInviteContacts] = useState([]);
  useEffect(() => {
    if (!currentUserId) return;
    const fetchInviteContacts = async () => {
      // Get all contacts for current user
      const { data: contacts } = await supabase
        .from('contact')
        .select('*')
        .eq('user_id', currentUserId)
        .not('email', 'is', null);

      if (!contacts?.length) {
        setInviteContacts([]);
        return;
      }
      // Get all registered emails
      const emails = contacts.map(c => c.email);
      const { data: profiles } = await supabase
        .from('user_profile')
        .select('email');
      const registeredEmails = profiles?.map(p => p.email) || [];
      // Filter contacts whose email is not in registeredEmails
      const notRegistered = contacts.filter(c => !registeredEmails.includes(c.email));
      setInviteContacts(notRegistered);
    };
    fetchInviteContacts();
  }, [currentUserId]);

  // Invite handler (dummy, replace with backend API for real email)
  const handleInvite = async (email) => {
    alert(`Invite sent to ${email}`);
    // TODO: Call backend API to send email invite
  };
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [realtimeSub, setRealtimeSub] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());
  const chatEndRef = useRef();
  const fileInputRef = useRef(null);

  // ...existing code...

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

  // Fetch message history
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

  // Subscribe to new incoming messages
  useEffect(() => {
    if (!currentUserId || realtimeSub) return;

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
        async (payload) => {
          const message = payload.new;
          if (selectedContact?.contact_user_id === message.sender_id) {
            setMessages(prev => [...prev, message]);
          }
          // Handle file messages
          if (message.content.startsWith('[file]')) {
            const [, rest] = message.content.split('[file]');
            const [fileName, fileUrl] = rest.split('|');
            await supabase.from('shared_documents').insert({
              user_id: currentUserId, // The owner (sender or receiver)
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

    setRealtimeSub(sub);

    return () => {
      if (sub) supabase.removeChannel(sub);
    };
  }, [currentUserId, selectedContact, realtimeSub]);

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

    const { error } = await supabase.from('messages').insert(msg);
    if (!error) {
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
    } else {
      console.error("Failed to send message:", error.message);
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
    // Upload to Supabase Storage
    const filePath = `chat/${currentUserId}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('chat').upload(filePath, file);
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
    // Send as a message with file info
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
      // Insert for sender
      await supabase.from('shared_documents').insert({
        user_id: currentUserId,
        file_name: file.name,
        file_url: fileUrl,
        uploaded_at: new Date().toISOString(),
        sender_id: currentUserId,
        receiver_id: selectedContact.contact_user_id,
        message_id: messageId,
      });
      // Insert for receiver
      await supabase.from('shared_documents').insert({
        user_id: selectedContact.contact_user_id, // <-- receiver's id!
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
    <div className="w-72 bg-blue-50 border-r border-blue-200 p-4 overflow-y-auto">
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
                    <div className="text-xs text-slate-500 truncate w-full">{c.email}</div>
                  </div>
                  <div className="flex-shrink-0 flex items-center justify-end" style={{ minWidth: '80px' }}>
                    <button
                      className="w-[70px] px-0 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow text-center"
                      onClick={() => handleInvite(c.email)}
                      title="Send invite via email"
                    >
                      Invite
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
    </div>

    {/* Chat Area */}
    <div className="flex-1 flex flex-col h-full">
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
            {messages.length === 0 ? (
              <div className="text-slate-500 py-24 text-center">No messages yet.</div>
            ) : (
              messages.map((m) => {
                // Check if message is a file
                let isFile = false, fileName = '', fileUrl = '';
                if (m.content.startsWith('[file]')) {
                  isFile = true;
                  const [, rest] = m.content.split('[file]');
                  [fileName, fileUrl] = rest.split('|');
                }
                return (
                  <div
                    key={m.id || m.timestamp}
                    className={`flex ${m.sender_id === currentUserId ? 'justify-end' : 'justify-start'} mb-1`}
                  >
                    <div
                      className={`rounded-xl px-4 py-2 max-w-[72%] text-sm whitespace-pre-line ${
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
                      <div className="text-xs text-right text-slate-300 mt-1">
                        {new Date(m.timestamp).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef}></div>
          </div>

          {/* Message Input */}
          <div className="border-t p-4 bg-blue-100 flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 rounded-lg border border-blue-200 outline-none text-slate-700"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white rounded-lg px-5 py-2 font-semibold hover:bg-blue-700"
              type="button"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
            >
              Send
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.png,.jpeg"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              aria-label="Attach file"
              title="Attach file"
              className="text-xl"
            >
              📎
            </button>
          </div>
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
