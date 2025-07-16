import React, { useState } from 'react';
import { User, Phone, Mail, Search, Plus, Edit2, Trash2, Users, BookOpen, Settings, LogOut } from 'lucide-react';

// Mock ContactForm component
const ContactForm = ({ contact, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    category_id: contact?.category_id || categories[0]?.category_id || 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
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
        <h3 style={{ marginBottom: '1.5rem', color: '#334155' }}>
          {contact ? 'Edit Contact' : 'Add New Contact'}
        </h3>
        <form onSubmit={handleSubmit}>
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

const Dashboard = ({ currentUser = { user_id: 1, name: 'John Doe', email: 'john@example.com' }, onLogout = () => {} }) => {
  const [contacts, setContacts] = useState([
    {
      contact_id: 1,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '+1 (555) 123-4567',
      category_id: 1,
      user_id: currentUser.user_id
    },
    {
      contact_id: 2,
      name: 'Bob Smith',
      email: 'bob@company.com',
      phone: '+1 (555) 234-5678',
      category_id: 3,
      user_id: currentUser.user_id
    },
    {
      contact_id: 3,
      name: 'Carol Wilson',
      email: 'carol@example.com',
      phone: '+1 (555) 345-6789',
      category_id: 2,
      user_id: currentUser.user_id
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

  const styles = {
    dashboard: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    sidebar: {
      width: '240px',
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
    },
    sidebarTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '2rem',
      color: '#0f172a',
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      margin: '0.25rem 0',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: '#64748b',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    navItemActive: {
      backgroundColor: '#e0f2fe',
      color: '#0369a1',
    },
    navIcon: {
      marginRight: '0.75rem',
    },
    logoutItem: {
      marginTop: 'auto',
      paddingTop: '1rem',
      borderTop: '1px solid #f1f5f9',
    },
    mainContent: {
      flex: 1,
      padding: '2rem',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
    },
    headerTitle: {
      fontSize: '1.75rem',
      fontWeight: '600',
      color: '#0f172a',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    avatar: {
      width: '36px',
      height: '36px',
      backgroundColor: '#0ea5e9',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '600',
      fontSize: '0.875rem',
    },
    userName: {
      color: '#475569',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    controls: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      flexWrap: 'wrap',
    },
    searchBox: {
      flex: 1,
      minWidth: '200px',
      position: 'relative',
    },
    searchInput: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 2.5rem',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '0.875rem',
      backgroundColor: 'white',
      outline: 'none',
      boxSizing: 'border-box',
    },
    searchIcon: {
      position: 'absolute',
      left: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#94a3b8',
    },
    select: {
      padding: '0.75rem 1rem',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      backgroundColor: 'white',
      fontSize: '0.875rem',
      outline: 'none',
      color: '#64748b',
    },
    addButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      backgroundColor: '#0ea5e9',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'background-color 0.2s ease',
    },
    contactGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem',
    },
    contactCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s ease',
    },
    contactHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem',
    },
    contactName: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#0f172a',
      marginBottom: '0.5rem',
    },
    contactCategory: {
      fontSize: '0.75rem',
      color: '#0369a1',
      backgroundColor: '#e0f2fe',
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      fontWeight: '500',
    },
    contactInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.5rem',
      color: '#64748b',
      fontSize: '0.875rem',
    },
    contactActions: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
    },
    actionButton: {
      padding: '0.5rem',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    editButton: {
      backgroundColor: '#f0f9ff',
      color: '#0369a1',
    },
    deleteButton: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
    },
    emptyState: {
      textAlign: 'center',
      color: '#94a3b8',
      fontSize: '1rem',
      padding: '3rem',
    },
    settingsCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid #e2e8f0',
      maxWidth: '500px',
    },
  };

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
    <div style={styles.dashboard}>
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Contact Book</h2>
        <nav style={{ flex: 1 }}>
          {sidebarItems.map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                style={{
                  ...styles.navItem,
                  ...(activeTab === item.id ? styles.navItemActive : {}),
                  ':hover': { backgroundColor: '#f8fafc' }
                }}
                onClick={() => setActiveTab(item.id)}
                onMouseEnter={(e) => {
                  if (activeTab !== item.id) {
                    e.target.style.backgroundColor = '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== item.id) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon size={18} style={styles.navIcon} />
                {item.label}
              </div>
            );
          })}
        </nav>
        <div style={styles.logoutItem}>
          <div
            style={styles.navItem}
            onClick={onLogout}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#fef2f2';
              e.target.style.color = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#64748b';
            }}
          >
            <LogOut size={18} style={styles.navIcon} />
            Logout
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>
            {activeTab === 'contacts' ? 'Contacts' : 
             activeTab === 'categories' ? 'Categories' : 'Settings'}
          </h1>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {currentUser?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={styles.userName}>{currentUser?.name}</span>
          </div>
        </div>

        {activeTab === 'contacts' && (
          <>
            <div style={styles.controls}>
              <div style={styles.searchBox}>
                <Search size={18} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  style={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                style={styles.select}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button
                style={styles.addButton}
                onClick={() => setShowAddContact(true)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#0284c7';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#0ea5e9';
                }}
              >
                <Plus size={18} />
                Add Contact
              </button>
            </div>

            {filteredContacts.length === 0 ? (
              <div style={styles.emptyState}>
                {contacts.length === 0 ? 
                  'No contacts yet. Add your first contact!' : 
                  'No contacts match your search criteria.'}
              </div>
            ) : (
              <div style={styles.contactGrid}>
                {filteredContacts.map(contact => (
                  <div
                    key={contact.contact_id}
                    style={styles.contactCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={styles.contactHeader}>
                      <div>
                        <h3 style={styles.contactName}>{contact.name}</h3>
                        <span style={styles.contactCategory}>
                          {getCategoryName(contact.category_id)}
                        </span>
                      </div>
                    </div>
                    <div style={styles.contactInfo}>
                      <Mail size={16} />
                      <span>{contact.email}</span>
                    </div>
                    <div style={styles.contactInfo}>
                      <Phone size={16} />
                      <span>{contact.phone}</span>
                    </div>
                    <div style={styles.contactActions}>
                      <button
                        style={{...styles.actionButton, ...styles.editButton}}
                        onClick={() => setEditingContact(contact)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#dbeafe';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#f0f9ff';
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        style={{...styles.actionButton, ...styles.deleteButton}}
                        onClick={() => deleteContact(contact.contact_id)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#fee2e2';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#fef2f2';
                        }}
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

        {activeTab === 'categories' && (
          <>
            <div style={styles.controls}>
              <button
                style={styles.addButton}
                onClick={() => setShowAddCategory(true)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#0284c7';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#0ea5e9';
                }}
              >
                <Plus size={18} />
                Add Category
              </button>
            </div>
            <div style={styles.contactGrid}>
              {categories.map(category => (
                <div key={category.category_id} style={styles.contactCard}>
                  <h3 style={styles.contactName}>{category.name}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    {contacts.filter(c => c.category_id === category.category_id).length} contacts
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <div style={styles.settingsCard}>
            <h3 style={styles.contactName}>Account Settings</h3>
            <div style={styles.contactInfo}>
              <User size={16} />
              <span>{currentUser?.name}</span>
            </div>
            <div style={styles.contactInfo}>
              <Mail size={16} />
              <span>{currentUser?.email}</span>
            </div>
          </div>
        )}
      </div>

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