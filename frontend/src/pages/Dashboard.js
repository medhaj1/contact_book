import React, { useState } from 'react';
import { User, Phone, Mail, Search, Plus, Edit2, Trash2, Users, BookOpen, Settings, LogOut, Camera, X } from 'lucide-react';

// Mock ContactForm component with image support
const ContactForm = ({ contact, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    category_id: contact?.category_id || categories[0]?.category_id || 1,
    image: contact?.image || null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({...formData, image: event.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({...formData, image: null});
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        width: '400px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#334155' }}>
          {contact ? 'Edit Contact' : 'Add New Contact'}
        </h3>
        <form onSubmit={handleSubmit}>
          {/* Image Upload Section */}
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <div style={{
              width: '100px',
              height: '100px',
              margin: '0 auto 1rem',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              border: '2px dashed #cbd5e1'
            }}>
              {formData.image ? (
                <>
                  <img 
                    src={formData.image} 
                    alt="Contact" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: 'rgba(220, 38, 38, 0.8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <Camera size={32} color="#94a3b8" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#f8fafc',
                color: '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              {formData.image ? 'Change Photo' : 'Add Photo'}
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({...formData, category_id: parseInt(e.target.value)})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              {categories.map(category => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#0ea5e9',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Mock CategoryForm component
const CategoryForm = ({ onSave, onCancel }) => {
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onSave(categoryName.trim());
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        width: '400px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#334155' }}>Add New Category</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#0ea5e9',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Dashboard = ({ currentUser = { user_id: 1, name: 'John Doe', email: 'john@example.com' }, onLogout = () => {}, onProfileClick = () => {} }) => {
  const [contacts, setContacts] = useState([
    {
      contact_id: 1,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '+1 (555) 123-4567',
      category_id: 1,
      user_id: currentUser.user_id,
      image: null
    },
    {
      contact_id: 2,
      name: 'Bob Smith',
      email: 'bob@company.com',
      phone: '+1 (555) 234-5678',
      category_id: 3,
      user_id: currentUser.user_id,
      image: null
    },
    {
      contact_id: 3,
      name: 'Carol Wilson',
      email: 'carol@example.com',
      phone: '+1 (555) 345-6789',
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
              isActive ? 'bg-sky-100 text-sky-700' : 'text-slate-500 hover:bg-slate-100'
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
        className="flex items-center px-4 py-2 rounded-lg cursor-pointer text-slate-500 hover:bg-blue-50 hover:text-sky-700 text-sm font-medium"
        onClick={onProfileClick}
      >
        <User size={18} className="mr-3" />
        Profile
      </div>
      <div
        className="flex items-center px-4 py-2 rounded-lg cursor-pointer text-slate-500 hover:bg-red-50 hover:text-red-600 text-sm font-medium"
        onClick={onLogout}
      >
        <LogOut size={18} className="mr-3" />
        Logout
      </div>
    </div>
  </div>

  {/* Main Content */}
  <div className="flex-1 p-8">
    {/* Header */}
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-semibold text-slate-900 capitalize">{activeTab}</h1>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-sky-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {currentUser?.name?.charAt(0).toUpperCase()}
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
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-200 text-sm focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 rounded-md border border-slate-200 text-sm text-slate-500"
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
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-md text-sm hover:bg-sky-600"
          >
            <Plus size={16} />
            Add Contact
          </button>
        </div>

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
                className="bg-white border border-slate-200 p-6 rounded-xl transition hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-semibold text-lg overflow-hidden mr-4">
                    {contact.image ? (
                      <img src={contact.image} alt={contact.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      contact.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{contact.name}</h3>
                    <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">
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
                    className="p-2 bg-blue-50 text-sky-600 rounded-md hover:bg-blue-100"
                    onClick={() => setEditingContact(contact)}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                    onClick={() => deleteContact(contact.contact_id)}
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
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-md text-sm hover:bg-sky-600"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category.category_id} className="bg-white border border-slate-200 p-6 rounded-xl">
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