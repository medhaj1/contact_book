import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Search, Plus, Edit2, Trash2, Users, BookOpen, Settings, LogOut, MessageCircle} from 'lucide-react';
import ContactForm from '../components/dashboard/ContactForm';
import CategoryForm from '../components/dashboard/CategoryForm';
import BirthdayReminder from './BirthdayReminder';

const Dashboard = ({ currentUser = { user_id: 1, name: 'John Doe', email: 'john@example.com', image: null }, onLogout = () => {} }) => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([
    {
      contact_id: 1,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '+1 (555) 123-4567',
      birthday: '2024-08-02',
      category_id: 1,
      user_id: currentUser.user_id,
      image: null
    },
    {
      contact_id: 2,
      name: 'Bob Smith',
      email: 'bob@company.com',
      phone: '+1 (555) 234-5678',
      birthday: '2024-08-05',
      category_id: 3,
      user_id: currentUser.user_id,
      image: null
    },
    {
      contact_id: 3,
      name: 'Carol Wilson',
      email: 'carol@example.com', 
      phone: '+1 (555) 345-6789',
      birthday: '2024-08-10',
      category_id: 2,
      user_id: currentUser.user_id,
      image: null
    }
  ]);

  const [categories, setCategories] = useState([
    { category_id: 1, name: 'Family' },
    { category_id: 2, name: 'Friends' },
    { category_id: 3, name: 'Work' },
    { category_id: 4, name: 'Business' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts');



  // Contact Management Functions
  const addContact = (contactData) => {
    const newContact = {
      contact_id: Date.now(),
      ...contactData,
      user_id: currentUser.user_id
    };
    setContacts([...contacts, newContact]);
    setShowAddContact(false);
  };

  const updateContact = (contactData) => {
    setContacts(contacts.map(contact => 
      contact.contact_id === editingContact.contact_id 
        ? { ...contact, ...contactData }
        : contact
    ));
    setEditingContact(null);
  };

  const deleteContact = (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      setContacts(contacts.filter(contact => contact.contact_id !== contactId));
    }
  };

  const addCategory = (categoryName) => {
    const newCategory = {
      category_id: Date.now(),
      name: categoryName
    };
    setCategories([...categories, newCategory]);
    setShowAddCategory(false);
  };

  // Filter contacts based on search and category
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm);
    const matchesCategory = selectedCategory === '' || contact.category_id.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.category_id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const sidebarItems = [
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'categories', label: 'Categories', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
  {/* Sidebar */}
  <div className="w-60 bg-white p-6 border-r border-slate-200 flex flex-col">
    <h2 className="text-xl font-semibold text-slate-900 mb-8">Contact Book</h2>
    <nav className="flex-1 space-y-2">
      {sidebarItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <div
            key={item.id}
            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition text-sm font-medium ${
              isActive ? 'bg-blue-100 text-blue-700 scale-100 hover:scale-105' : 'text-slate-500 scale-100 hover:bg-slate-100 hover:scale-105 hover:text-slate-600'
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            <Icon size={18} className="mr-3" />
            {item.label}
          </div>
        );
      })}
    </nav>
    {/* Profile */}
    <div className="mt-auto border-t pt-4">
      <div
        className="flex items-center px-4 py-2 rounded-lg cursor-pointer text-slate-500 scale-100 hover:bg-blue-100 hover:text-blue-700 hover:scale-105 text-sm font-medium transition-transform transform"
        onClick={() => navigate('/profile')}
      >
        <User size={18} className="mr-3" />
        Profile
      </div>
      <div
        className="flex items-center px-4 py-2 rounded-lg cursor-pointer text-slate-500 scale-100 hover:scale-105 hover:bg-red-50 hover:text-red-600 text-sm font-medium transition-transform transform"
        onClick={onLogout}
      >
        <LogOut size={18} className="mr-3" />
        Logout
      </div>
    </div>
  </div>

  {/* Main Content */}
  <div className="flex-1 p-8 bg-blue-50">
    {/* Header */}
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-semibold text-slate-900 capitalize">{activeTab}</h1>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-r from-blue-700 to-blue-400 shadow-lg border-1 border-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm scale-100 hover:scale-105 hover:from-blue-700 hover:to-blue-500 transform transition-transform transition-colors duration-200 overflow-hidden">
          {currentUser?.image ? (
            <img src={currentUser.image} alt={currentUser?.name} className="w-full h-full object-cover" />
          ) : (
            currentUser?.name?.charAt(0).toUpperCase()
          )}
        </div>
        <span className="text-sm text-slate-600 font-medium">{currentUser?.name}</span>
      </div>
    </div>

    {/* Contacts Tab */}
    {activeTab === 'contacts' && (
      <>
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" placeholder="Search contacts..." value={searchTerm}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-blue-100 text-sm focus:outline-none hover:border-blue-200 hover:shadow focus:ring-1 focus:ring-blue-100 transition-colors"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="pl-6 pr-3 py-2 rounded-xl border border-blue-100 text-md focus:outline-none hover:border-blue-200 hover:shadow focus:ring-1 focus:ring-blue-100 transition-colors"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.category_id} value={c.category_id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAddContact(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-400 text-white rounded-xl text-md scale-100 hover:from-blue-800 hover:to-blue-500 hover:scale-105 transform transition-transform duration-200 transition-colors"
          >
            <Plus size={16} />
            Add Contact
          </button>
        </div>

        {/* Birthday Reminders */}
        <BirthdayReminder contacts={contacts} />

        {/* Contact Cards */}
        {filteredContacts.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            {contacts.length === 0 ? "No contacts yet. Add your first contact!" : "No contacts match your search criteria."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map(contact => (
              <div
                key={contact.contact_id}
                className="bg-white border border-blue-100 p-6 rounded-2xl transition hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-lg overflow-hidden mr-4">
                    {contact.image ? (
                      <img src={contact.image} alt={contact.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      contact.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{contact.name}</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                      {getCategoryName(contact.category_id)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Mail size={16} />
                  <span>{contact.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Phone size={16} />
                  <span>{contact.phone}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    className="p-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100"
                    onClick={() => console.log('Chat with', contact.name)}
                    title="Chat"
                  >
                    <MessageCircle size={16} />
                  </button>
                  <button
                    className="p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                    onClick={() => setEditingContact(contact)}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                    onClick={() => deleteContact(contact.contact_id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )}

    {/* Categories Tab */}
    {activeTab === 'categories' && (
      <>
        <div className="flex mb-8">
          <button
            onClick={() => setShowAddCategory(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-400 scale-100 hover:scale-105 hover:from-blue-800 hover:to-blue-500 text-white rounded-xl text-md transform transition-transform duration-200 transition-colors"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category.category_id} className="bg-white border border-slate-200 p-6 rounded-2xl scale-100 hover:shadow-md hover:scale-105 transition-transform duration-200">
              <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
              <p className="text-sm text-slate-500 mt-1">
                {contacts.filter(c => c.category_id === category.category_id).length} contacts
              </p>
            </div>
          ))}
        </div>
      </>
    )}

    {/* Settings Tab */}
    {activeTab === 'settings' && (
      <div className="bg-white p-6 rounded-xl border border-slate-200 max-w-md">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Settings</h3>
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
          <User size={16} />
          <span>{currentUser?.name}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Mail size={16} />
          <span>{currentUser?.email}</span>
        </div>
      </div>
    )}
  </div>

  {/* Modals */}
  {showAddContact && (
    <ContactForm
      categories={categories}
      onSave={addContact}
      onCancel={() => setShowAddContact(false)}
    />
  )}
  {editingContact && (
    <ContactForm
      contact={editingContact}
      categories={categories}
      onSave={updateContact}
      onCancel={() => setEditingContact(null)}
    />
  )}
  {showAddCategory && (
    <CategoryForm
      onSave={addCategory}
      onCancel={() => setShowAddCategory(false)}
    />
  )}
</div>
);
};

export default Dashboard;