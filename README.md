# Contact Book Application

A modern, full-featured contact management application built with React and Supabase.

## 🚀 Architecture

This application uses a **frontend-only architecture** with Supabase as the backend service. All business logic has been moved from a separate Express server directly into the React frontend using organized service layers.

### Key Benefits:
- ✅ **No Express backend required**
- ✅ **Simplified deployment** (single static app)
- ✅ **Direct Supabase integration**
- ✅ **Better performance** (fewer network hops)
- ✅ **Real-time capabilities** ready

## 📋 Features

- **Contact Management**: Full CRUD operations for contacts
- **Photo Management**: Upload and manage contact photos
- **Categories**: Organize contacts with custom categories
- **Import/Export**: Support for CSV and VCF file formats
- **Birthday Reminders**: Automatic birthday notifications
- **Document Management**: Upload and organize documents
- **User Profiles**: Complete user profile management with avatars
- **Search & Filter**: Advanced search and category filtering
- **Responsive Design**: Works on desktop and mobile
- **Dark Mode**: Full dark mode support

## 🛠 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Supabase account

### Installation

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure Supabase:**
   - Update `src/supabaseClient.js` with your Supabase credentials
   - Set up required database tables and storage buckets (see MIGRATION_GUIDE.md)

4. **Start the application:**
```bash
npm start
```

The app will be available at `http://localhost:3000`

## 📚 Documentation

- [**Migration Guide**](./MIGRATION_GUIDE.md) - Detailed setup and migration information
- [**Service Architecture**](./frontend/src/services/) - How the service layer works

## 🏗 Project Structure

```
contact_book/
├── frontend/                 # React application
│   ├── src/
│   │   ├── services/        # Supabase service layer
│   │   │   ├── contactService.js
│   │   │   ├── categoryService.js
│   │   │   ├── importExportService.js
│   │   │   └── userService.js
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   └── supabaseClient.js
│   └── package.json
├── backend/                 # ⚠️ DEPRECATED - No longer needed
└── MIGRATION_GUIDE.md       # Setup instructions
```

## 🔧 Service Layer

The application uses a clean service architecture:

- **contactService.js**: Contact CRUD operations, photo uploads
- **categoryService.js**: Category management
- **importExportService.js**: CSV/VCF import/export functionality  
- **userService.js**: User profile and avatar management

Each service provides clean, reusable functions that can be easily tested and maintained.

## 🚀 Deployment

Since this is now a frontend-only application, it can be deployed to any static hosting service:

- **Vercel** (recommended)
- **Netlify**
- **AWS S3 + CloudFront**
- **GitHub Pages**

Simply run `npm run build` and deploy the `build` folder.

## 🔐 Security

- Configure Row Level Security (RLS) policies in Supabase
- Set up proper access controls for storage buckets
- Use environment variables for configuration
- Enable appropriate CORS settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the existing service patterns
4. Add tests for new functionality
5. Submit a pull request

## ⚡ Performance

- Direct client-to-database communication
- Optimized file uploads to Supabase Storage
- Efficient caching strategies
- Lazy loading of components

<img width="747" height="809" alt="Contact Book Screenshot" src="https://github.com/user-attachments/assets/af261565-23fa-4f3e-ad72-5953c729b805" />

---

**Note**: The `backend/` directory contains the old Express.js implementation and is no longer needed. All functionality has been migrated to the frontend using Supabase services.