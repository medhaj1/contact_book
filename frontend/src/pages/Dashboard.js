import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, BookOpen, Settings, CheckSquare, MessageSquare,
  Grid, List, Plus, Edit2, Trash2, User, LogOut,
  Mail, Phone, Search, Star, Tags
} from "lucide-react";
import ChatPanel from '../components/chat/ChatPanel';
import { supabase } from '../supabaseClient';

import ContactForm from '../components/dashboard/ContactForm';
import BirthdayReminder from '../components/dashboard/BirthdayReminder';
import TaskPanel from '../components/dashboard/TaskPanel';
import SettingsTab from '../components/dashboard/SettingsTab';
import DocumentsPanel from '../components/dashboard/DocumentsPanel';
import CategoriesPanel from '../components/dashboard/CategoriesPanel';
import ImportModal from '../components/dashboard/ImportModal';
import GroupPanel from '../components/groups/GroupPanel';
import SharedDocumentsPanel from '../components/dashboard/SharedDocumentsPanel';
import { getFavouritesByUser, addFavourite, removeFavourite } from "../services/favouriteService";
import { useBlockedContacts } from "../components/dashboard/BlockedContactsContext";

// Import services
import { getContacts, deleteContact } from '../services/contactService';
import { getCategories } from '../services/categoryService';

// Utility function to check if birthday is today
function isBirthdayToday(birthday) {
  if (!birthday) return false;
  
  try {
    const today = new Date();
    const bdate = new Date(birthday);
    
    // Check if the date is valid
    if (isNaN(bdate.getTime())) return false;
    
    return bdate.getDate() === today.getDate() && bdate.getMonth() === today.getMonth();
  } catch (error) {
    console.error("Error parsing birthday date:", birthday, error);
    return false;
  }
}



const Dashboard = ({ currentUser, onLogout = () => {} }) => {
  const { blockedContacts } = useBlockedContacts();
  const navigate = useNavigate();
  const userName =
    currentUser?.user_metadata?.name ||
    currentUser?.email?.split("@")[0] ||
    "User";
  const userId = currentUser?.id || "unknown";


  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("dashboardActiveTab") || "contacts"
  );
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAddContactDropdown, setShowAddContactDropdown] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const [viewMode, setViewMode] = useState("card");


  const [favourites, setFavourites] = useState([]);
  const [contactViewFilter, setContactViewFilter] = useState("all");


  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getContacts(userId);
      setContacts(result.success ? result.data : []);
    } finally {
      setLoading(false);
    }
  }, [userId]);


  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const result = await getCategories();
      setCategories(result.success ? result.data : []);
    } catch {
      setCategories([]);
    }
  }, []);


  // Fetch favourites from Supabase
  const fetchFavourites = useCallback(async () => {
    if (!userId || userId === "unknown") return;
    const favRes = await getFavouritesByUser(userId);
    if (favRes.success) {
      setFavourites(favRes.data);
    }
  }, [userId]);


  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);


  useEffect(() => {
    if (userId && userId !== "unknown") {
      fetchContacts();
      fetchCategories();
      fetchFavourites();
    }
  }, [userId, fetchContacts, fetchCategories, fetchFavourites]);


  useEffect(() => {
    localStorage.setItem("dashboardActiveTab", activeTab);
  }, [activeTab]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest(".relative"))
        setShowUserDropdown(false);
      if (showAddContactDropdown && !event.target.closest(".relative"))
        setShowAddContactDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserDropdown, showAddContactDropdown]);


  const handleContactSave = async () => {
    await fetchContacts();
    setShowAddContact(false);
    setEditingContact(null);
  };


  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setShowAddContact(false);
  };


  const handleDeleteContact = async (contactId) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      const result = await deleteContact(contactId);
      if (result.success) fetchContacts();
    }
  };


  // Toggle favourite in Supabase
  const toggleFavourite = async (contactId) => {
    const isFav = favourites.includes(contactId);
    if (isFav) {
      await removeFavourite(userId, contactId);
      setFavourites((prev) => prev.filter((id) => id !== contactId));
    } else {
      await addFavourite(userId, contactId);
      setFavourites((prev) => [...prev, contactId]);
    }
  };


  const safeString = (val) => (val ? String(val) : "");


  // Modified filtering + sorting logic
  let filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      safeString(contact.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeString(contact.email).toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeString(contact.phone).includes(searchTerm);
    const matchesCategory =
      !selectedCategory || 
      (Array.isArray(contact.category_ids) && contact.category_ids.some(id => String(id) === String(selectedCategory)));
    return matchesSearch && matchesCategory;
  });

  if (contactViewFilter === "favourites") {
    filteredContacts = filteredContacts.filter((c) =>
      favourites.includes(c.contact_id)
    );
  } else if (contactViewFilter === "all") {
    //  Sort alphabetically by name when showing all
    filteredContacts = filteredContacts.sort((a, b) =>
      safeString(a.name).localeCompare(safeString(b.name))
    );
  }



  // Remove duplicate entries, keep intended icons.
  const sidebarItems = [
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'documents', label: 'Documents', icon: BookOpen },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'task', label: 'Task', icon: CheckSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];


  // Classnames for prettier transitions/buttons - reference 22: use 2nd code style
  const getSidebarItemClass = (isActive) =>
    `flex items-center px-4 py-2 rounded-lg cursor-pointer transition text-sm font-medium ${
      isActive
        ? 'bg-blue-100 dark:bg-indigo-300 text-blue-700 dark:text-indigo-900 scale-100 hover:scale-105'
        : 'text-slate-500 dark:text-slate-400 scale-100 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 hover:text-slate-600 dark:hover:text-slate-300'
    }`;
  
  // Card border color from 2nd code
  const cardBorderClass = "bg-white border border-blue-100 p-6 rounded-2xl transition hover:shadow-md hover:-translate-y-1";


  // Add this function inside Dashboard component
  const handleSendDocument = async (file) => {
    if (!file || !currentUser?.id) return;
    // Generate a unique filename
    const filePath = `chat/${currentUser.id}/${Date.now()}_${file.name}`;
    // Upload to Supabase Storage (make sure you have a 'chat' bucket)
    const { data, error } = await supabase.storage.from('chat').upload(filePath, file);
    if (error) {
      alert('File upload failed: ' + error.message);
      return;
    }
    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('chat').getPublicUrl(filePath);
    const fileUrl = publicUrlData?.publicUrl;
    if (!fileUrl) {
      alert('Could not get file URL');
      return;
    }
    // Send as a message (you may want to distinguish file messages)
    // You need to know the selectedContact here, so you may need to lift state up if needed
    // For now, you can pass a callback to ChatPanel and handle message sending there
  };

  const renderCategoryBadges = (contact) => {
    if (!Array.isArray(contact.category_ids) || contact.category_ids.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {contact.category_ids.map((id) => {
          const cat = categories.find(c => String(c.category_id ?? c.id) === String(id));
          const name = cat?.category_name || cat?.name || "Unknown";
          return (
<span
            key={id}
            className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full dark:bg-indigo-700 dark:text-indigo-100"
          >
            {name}
          </span>

          );
        })}
      </div>
    );
  };



  return (
    <div className="flex min-h-screen font-sans">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-60 h-screen bg-white dark:bg-[#161b22] p-6 border-r border-slate-200 dark:border-[#30363d] flex flex-col overflow-y-auto z-10 fixed-sidebar">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-300 mb-8">Contact Book</h2>
        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center px-4 py-2 rounded-lg cursor-pointer ${
                  activeTab === item.id
                    ? "bg-blue-100 dark:bg-indigo-300 text-blue-700 dark:text-indigo-900"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={18} className="mr-3" />
                {item.label}
              </div>
            );
          })}
        </nav>
      </div>


      {/* Main area */}
      <div className="flex-1 ml-60 p-8 bg-blue-50 dark:bg-[#0d1117]">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-[#c9d1d9] capitalize">{activeTab}</h1>
          <div className="relative flex items-center gap-3">
            <div
              className="flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-[#161b22] hover:shadow-sm transition-all duration-200"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <div className="w-9 h-9 bg-gradient-to-r from-blue-700 to-blue-400 dark:from-indigo-700 dark:to-indigo-400 rounded-full flex justify-center items-center text-white font-bold overflow-hidden">
                {currentUser?.user_metadata?.image && !profileImageError ? (
                  <img
                    src={currentUser.user_metadata.image}
                    alt={userName}
                    className="w-full h-full object-cover rounded-full"
                    onError={() => setProfileImageError(true)}
                  />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </div>

              <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{userName}</span>
             <svg
  className={`w-4 h-4 text-slate-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
>

                fill="none" stroke="currentColor" viewBox="0 0 24 24"


                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {showUserDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#161b22] rounded-xl shadow-lg border border-slate-200 dark:border-[#30363d] py-1 z-50">
                  <div
                    className="flex items-center mx-1 px-4 py-2 text-sm rounded-lg text-slate-700 dark:text-[#c9d1d9] hover:text-blue-700 dark:hover:font-semibold dark:hover:text-indigo-200 hover:bg-blue-100 dark:hover:bg-indigo-500/30 cursor-pointer"
                    onClick={() => {
                    navigate('/profile');
                    setShowUserDropdown(false);
                  }}
                  >
                    <User size={16} className="mr-2 inline" /> Profile
                  </div>
                  <div
                    className="flex items-center mx-1 px-4 py-2 text-sm rounded-lg text-slate-700 dark:text-[#c9d1d9] hover:text-blue-700 dark:hover:font-semibold dark:hover:text-red-200 hover:bg-blue-100 dark:hover:bg-red-700/30 cursor-pointer"
                    onClick={onLogout}
                  >
                    <LogOut size={16} className="mr-2 inline" /> Logout
                  </div>
              </div>
            )}
          </div>
        </div>


        {activeTab === "contacts" && (
          <>
            {/* Controls */}
            <div className="flex flex-wrap gap-4 mb-8 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border text-sm dark:bg-[#161b22] dark:border-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-blue-400 dark:focus:ring-indigo-600 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="pl-6 pr-3 py-2 rounded-xl border text-md dark:bg-[#161b22] dark:border-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-blue-400 dark:focus:ring-indigo-600 outline-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.category_id ?? c.id} value={c.category_id ?? c.id}>
                    {c.category_name || c.name}
                  </option>
                ))}
              </select>
              <select
                className="px-3 py-2 rounded-xl border text-md dark:bg-[#161b22] dark:border-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-blue-400 dark:focus:ring-indigo-600 outline-none"
                value={contactViewFilter}
                onChange={(e) => setContactViewFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="favourites">Favourites</option>
              </select>
              <div className="flex h-10 bg-white dark:bg-[#161b22] rounded-xl border dark:border-slate-700">
                <button onClick={() => setViewMode("card")} className={`p-2 rounded-xl ${viewMode === "card" ? "bg-blue-500 dark:bg-indigo-600 text-white" : "text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200"}`} title="Card view">
                  <Grid size={18} />
                </button>
                <button onClick={() => setViewMode("list")} className={`p-2 rounded-xl ${viewMode === "list" ? "bg-blue-500 dark:bg-indigo-600 text-white" : "text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200"}`} title="List view">
                  <List size={18} />
                </button>
              </div>
            </div>


            <BirthdayReminder contacts={contacts} />


{/* Contact display */}
{loading ? (
  <div className="text-center py-12 text-slate-400">Loading contacts...</div>
) : filteredContacts.length === 0 ? (
  <div className="text-center py-12 text-slate-400">{contacts.length === 0 ? "No contacts yet." : "No matches found."}</div>
) : viewMode === "card" ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredContacts.map((c) => {
      const isFav = favourites.includes(c.contact_id);
      return (
        <div key={c.contact_id} className="bg-white dark:text-gray-300 dark:bg-[#161b22] p-6 rounded-2xl border dark:border-[#30363d] hover:shadow-lg scale-100 hover:scale-105 transition transition-transform duration-200 space-y-3 ">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-indigo-500 flex justify-center items-center font-bold overflow-hidden">
                {c.photo_url ? <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" /> : safeString(c.name).charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold">{c.name}</h3>
                {renderCategoryBadges(c)}
              </div>
            </div>
            <button onClick={() => toggleFavourite(c.contact_id)}>
              <Star size={18} className={isFav ? "text-yellow-400 fill-yellow-400" : "text-slate-400"} />
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
            <Mail size={14} /> {c.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
            <Phone size={14} /> {c.phone}
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => handleEditContact(c)} className="p-2 bg-blue-50 dark:bg-indigo-600/50 text-blue-600 dark:text-indigo-200 rounded-lg hover:bg-blue-100">
              <Edit2 size={14} />
            </button>
            <button onClick={() => handleDeleteContact(c.contact_id)} className="p-2 bg-red-50 dark:bg-red-600/50 text-red-600 rounded-lg dark:text-red-200 hover:bg-red-100">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      );
    })}
  </div>
) : (
  // LIST VIEW - updated for dark mode and matching styling
  <div className="bg-white dark:bg-[#161b22] border dark:border-[#30363d] rounded-lg shadow overflow-hidden">
    {filteredContacts.map((c) => {
      const isFav = favourites.includes(c.contact_id);
      return (
        <div key={c.contact_id} className="flex items-center justify-between px-4 py-4 hover:bg-blue-50 dark:hover:bg-gray-800/40 even:bg-slate-50 dark:even:bg-[#30363d]/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-indigo-500 flex items-center justify-center font-bold overflow-hidden">
              {c.photo_url ? <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" /> : safeString(c.name).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-200">{c.name}</div>
              {renderCategoryBadges(c)}
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400 pt-1">
                <Mail size={14} /> {c.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
                <Phone size={14} /> {c.phone}
              </div>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2 items-center">
            <button onClick={() => toggleFavourite(c.contact_id)}>
              <Star size={16} className={isFav ? "text-yellow-400 fill-yellow-400" : "text-slate-400"} />
            </button>
            <button onClick={() => handleEditContact(c)} className="p-1.5 sm:p-2 rounded-full bg-blue-50 dark:bg-indigo-800/70 text-blue-600 dark:text-indigo-100 hover:bg-blue-100 dark:hover:bg-indigo-700">
              <Edit2 size={14} />
            </button>
            <button onClick={() => handleDeleteContact(c.contact_id)} className="p-1.5 sm:p-2 w-8 h-18 rounded-full bg-red-50 dark:bg-red-800/40 text-red-600 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-800">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      );
    })}
  </div>
)}


            {/* Modals */}
            {showAddContact && (
              <ContactForm
                categories={categories}
                userId={userId}
                onSave={handleContactSave}
                onCancel={() => setShowAddContact(false)}
              />
            )}
            {editingContact && (
              <ContactForm
                contact={editingContact}
                categories={categories}
                userId={userId}
                onSave={handleContactSave}
                onCancel={() => setEditingContact(null)}
              />
            )}
            {showImportModal && (
              <ImportModal
                userId={userId}
                onImportComplete={fetchContacts}
                onClose={() => setShowImportModal(false)}
              />
            )}
          </>
        )}


        {activeTab === "categories" && (
          <CategoriesPanel
            categories={categories}
            contacts={contacts}
            userId={userId}
            onCategoriesChange={fetchCategories}
          />
        )}


        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <div className="max-w-6xl mx-auto">
            <GroupPanel currentUser={currentUser} />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <SettingsTab currentUser={currentUser} isDark={isDark} setIsDark={setIsDark}/>
        )}

        {/* Task Tab */}
        {activeTab === 'task' && (
          <div className="flex flex-col items-center w-full">
            <TaskPanel />
          </div>
        )}

        {activeTab === 'chat' && (
  <ChatPanel currentUser={currentUser} />
)}



        {activeTab === "settings" && (
          <SettingsTab currentUser={currentUser} isDark={isDark} setIsDark={setIsDark} />
        )}
        {activeTab === "task" && <TaskPanel />}
        {activeTab === "chat" && <ChatPanel currentUser={currentUser} />}
        {activeTab === "documents" && (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <label htmlFor="docType" className="font-semibold text-lg text-blue-700">Select:</label>
              <select
                id="docType"
                className="px-4 py-2 rounded-lg border text-md bg-white text-blue-700"
                value={viewMode}
                onChange={e => setViewMode(e.target.value)}
              >
                <option value="my">My Documents</option>
                <option value="shared">Shared Documents</option>
              </select>
            </div>
            {viewMode === "my" ? (
              <DocumentsPanel currentUser={currentUser} />
            ) : (
              <div className="mt-4">
                <SharedDocumentsPanel currentUser={currentUser} />
              </div>
            )}
          </div>
        )}
      </div>


      {activeTab === "contacts" && (
        <div className="fixed bottom-10 right-10 z-40">
          <div className="relative">
            <button
              onClick={() => setShowAddContactDropdown((prev) => !prev)}
              className="flex w-[70px] h-[70px] items-center px-5 py-3 rounded-full shadow-lg bg-gradient-to-r from-blue-700 to-blue-400 text-white font-bold hover:bg-blue-700 dark:from-indigo-800 dark:to-indigo-500 scale-100 hover:scale-110 transition-transform duration-200"
            >
              <Plus size={30}/>
            </button>
            {showAddContactDropdown && (
              <div className="absolute bottom-14 right-0 w-48 bg-white border rounded-lg shadow-lg">
                <div
                  className="px-4 py-3 hover:bg-slate-100 cursor-pointer"
                  onClick={() => {
                    setShowAddContact(true);
                    setShowAddContactDropdown(false);
                  }}
                >
                  Add via Form
                </div>
                <div
                  className="px-4 py-3 hover:bg-slate-100 cursor-pointer"
                  onClick={() => {
                    setShowImportModal(true);
                    setShowAddContactDropdown(false);
                  }}
                >
                  Import Contacts
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


export default Dashboard;