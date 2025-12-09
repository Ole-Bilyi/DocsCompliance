# 📋 DocsCompliance – Contract Management Platform

**DocsCompliance** is a professional contract management platform built with modern web technologies to help teams streamline document approvals, renewals, and compliance workflows. Designed for security and scalability, it provides a centralized workspace for managing legal documents, deadlines, and team collaboration.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org/) &emsp;&emsp;&emsp;
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com/) &emsp;&emsp;&emsp;
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev/) &emsp;&emsp;&emsp;
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)


## 🎯 **Key Features**

### 🔐 **Authentication & Security**
- Secure server-side sessions with **Iron-session** encryption
- Role-based access control (Admin vs. Member permissions)
- Automatic session restoration (24-hour persistence)

### 👥 **Team & Group Management**
- Create workspaces (groups) for team collaboration
- Join request system with admin approval workflow
- Real-time member management and permissions

### 📄 **Smart Contract Management**
- Upload and store contracts (PDF, DOCX, TXT)
- **AI-powered date extraction** from contract text
- Automatic deadline detection and tracking
- Full CRUD operations for document lifecycle

### 📅 **Calendar & Deadline System**
- Visual calendar view of all contract deadlines
- Status-based tracking (pending, deadline, overdue, completed)
- Automated email reminders via **Brevo integration**
- Daily digest emails for upcoming deadlines

### 🔔 **Automated Notifications**
- Daily email reminders for deadlines via **Brevo**
- Real-time deadline count synchronization
- Subscription-based access control with trial periods

## 🏗️ **Tech Stack**
| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 (App Router), React 19 | Modern, server-rendered UI |
| **Backend** | Next.js API Routes, Server Actions | Full-stack architecture |
| **Database** | Supabase (PostgreSQL) | Relational data with real-time capabilities |
| **Authentication** | Iron-session | Secure, encrypted server-side sessions |
| **Styling** | SCSS/CSS Modules | Modular, maintainable styles |
| **State** | React Context + Local State | Client-side state management |
| **Email** | Brevo (Sendinblue) | Transactional emails & automation |
| **Deployment** | Vercel | Serverless deployment with edge functions |


## 📁 **Project Structure**

```
docscompliance/
├── app/                     # Next.js App Router - Main application pages and API routes
│   ├── api/                 # API endpoints (Serverless Functions)
│   │   ├── auth/            # Authentication routes (login, logout, session management)
│   │   ├── brevo/           # Brevo email/SMS integration for notifications and reminders
│   │   ├── calendar-events/ # Calendar event CRUD operations and scheduling
│   │   ├── contracts/       # Document management - upload, metadata, text extraction
│   │   ├── dates/           # Deadline/task management with status tracking
│   │   ├── group/           # Team/workspace management (join, create, permissions)
│   │   ├── subscription/    # Subscription tier management and access control
│   │   └── trusted-users/   # Delegated admin permissions system
│   ├── billing/             # Subscription billing and payment management page
│   ├── calendar/            # Calendar interface for deadline visualization
│   ├── contracts/           # Contract/document list and management page
│   ├── create/              # Group creation wizard for new users
│   ├── group/               # Group member management and settings
│   ├── join/                # Group join request and invitation handling
│   ├── login/               # User authentication/login page
│   ├── mainPage/            # Main dashboard with stats and notifications
│   ├── session/             # Session management and user profile utilities
│   ├── settings/            # User preferences and account settings
│   ├── signup/              # User registration page
│   └── userProfile/         # User profile display and editing
├── components/              # Reusable React UI components (organized by feature)
│   ├── auth/                # Authentication forms and validation
│   ├── billing/             # Subscription plans, payment forms, billing history
│   ├── calendar/            # Calendar UI, event modals, date pickers
│   ├── context/             # React Context providers for global state
│   ├── contracts/           # Document upload, list, preview, and management
│   ├── group/               # Group member lists, join requests, admin tools
│   ├── layout/              # Layout wrappers (MainLayout, Sidebar, Topbar)
│   ├── main/                # Dashboard components (stats, charts, notifications)
│   ├── profile/             # User profile cards and editing forms
│   ├── settings/            # Settings panels, toggles, and preference forms
│   ├── styles/              # SCSS/CSS modules and styling utilities
│   ├── subscription/        # Subscription status displays and upgrade prompts
│   ├── theme/               # Theme switching and dark/light mode components
│   └── userGroup/           # User group management and role assignment
├── lib/                     # Server-side utility libraries and business logic
│   ├── auth.js              # Authentication helpers (session, validation, security)
│   ├── contracts.js         # Document processing, text extraction, file handling
│   ├── dates.js             # Date calculations, deadline tracking, reminders
│   ├── group.js             # Group operations, member management, permissions
│   ├── session.js           # Session storage and management (iron-session)
│   ├── subscription.js      # Subscription tier logic and access control
│   ├── supabaseAdmin.js     # Supabase database client with admin privileges
│   └── trustedUsers.js      # Trusted user delegation and permission management
└── public/                  # Static assets (images, icons, fonts, favicon)
```

## 🚀 **Key Technical Achievements**
### **1. Secure Authentication System**
- Implemented encrypted server-side sessions replacing vulnerable localStorage
- Built automatic session restoration with 24-hour persistence
- Created protected route wrapper (`MainLayout`) for all authenticated pages

### **2. Advanced PDF Processing**
- Developed multi-format document parser (PDF, DOCX, TXT)
- Implemented **AI-powered date extraction** with regex patterns for 5+ date formats
- Created fallback system between native Blob extraction and library parsing

### **3. Automated Email Reminder System**
- Integrated **Brevo API** for transactional emails
- Built daily cron job to sync deadline counts with user profiles
- Created automation workflows for deadline reminders
- Implemented batch processing for all users with rate limiting

### **4. Real-time Team Collaboration**
- Designed relational database schema for teams, users, and documents
- Built join request system with admin approval workflow
- Implemented subscription-based access control with trial periods
- Created real-time UI updates for team changes

### **5. Performance Optimization**
- Achieved **Lighthouse scores of 82+** across all pages
- Implemented dynamic imports for heavy components (Calendar)
- Optimized bundle size by 200+ KiB through code splitting
- Reduced main thread work by 60% through React optimizations

## 🗄️ **Database Schema (PostgreSQL)**

```sql
-- Core tables
users (user_id, email, password, user_name, group_id, admin, created_at)
groups (group_id, group_name, subscription, max_users, created_at)
contracts (cont_id, group_id, file_path, uploaded_by, uploaded_at)
contracts_metadata (cont_id, cont_name, cont_details, start_date, end_date, status, last_updated)
contracts_dates (cont_date_id, cont_id, date_id, created_at)
dates (date_id, group_id, date_title, date_details, due_date, status, assigned_to, deadline_days, created_at)
join_requests (requests_id, admin_id, user_id, status, created_at, updated_at)
trusted_users (id, admin_id, user_id, created_at)
```


## 🛠️ **API Endpoints**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/*` | POST | Login, logout, session management |
| `/api/contracts/*` | POST | Upload, list, delete contracts |
| `/api/calendar-events/*` | POST | Upload, list, delete events |
| `/api/dates/*` | POST | Create, update, delete deadlines |
| `/api/group/*` | POST | Group management, join requests |
| `/api/trusted-users/*` | POST | Trusted user management |
| `/api/subscription/*` | POST | Subscription access, upgrade |
| `/api/brevo/*` | POST | Email synchronization |
| `/api/extract-text` | POST | Extract dates from contract files |


## 📈 **Performance Metrics**
- **Page Load Time**: < 2.5 seconds
- **Lighthouse Score**: 82+ (Performance), 95+ (Accessibility)
- **Bundle Size**: Optimized to < 500 KiB initial load
- **API Response Time**: < 300ms for most endpoints
- **Database Queries**: Optimized with proper indexes


## 🔮 **Future Enhancements**
1. **Real-time Notifications** - WebSocket integration for live updates
2. **OCR Processing** - Text extraction from scanned documents
3. **Advanced Analytics** - Contract lifecycle reporting
4. **Mobile App** - React Native companion application
5. **Third-party Integrations** - Google Calendar

## 👨‍💻 **Development Insights**
### **Challenges Overcome**
- **PDF parsing compatibility**: Solved library conflicts between `pdf-parse` and `pdf-parse-new`
- **Email automation**: Implemented reliable daily cron jobs with Brevo webhooks
- **Performance optimization**: Reduced Total Blocking Time from 2.4s to 0.8s
- **State management**: Balanced React Context with server-side data fetching

### **Best Practices Implemented**
- Server-side authentication validation on every request
- Comprehensive error handling with user-friendly messages
- Environment-based configuration for different deployments
- Proper TypeScript typing where applicable
- Regular security audits and dependency updates
