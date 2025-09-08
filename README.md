# LuxyLyfe - Luxury Homes Website

A comprehensive luxury real estate platform built with Next.js, featuring property management, user authentication, and a complete content management system.

## 🏗️ Project Structure

This is a Next.js 14.2.5 application with TypeScript, Tailwind CSS, Prisma ORM, and MongoDB Atlas database.

## 🚀 Features

### 🏠 Property Management

- **Dynamic Property Listings**: Browse luxury properties with pagination and filtering
- **Property Details**: Detailed property information with image galleries
- **Property Types**: Support for Mansions, Penthouses, Estates, Waterfront, Mountain Retreats, and Historic Homes
- **Search & Filter**: Filter by property type, price range, and featured status
- **Responsive Design**: Optimized for all devices

### 🔐 Authentication System

- **Role-Based Access Control**: Three user roles - MEMBER, ADMIN, and SUPERADMIN
- **Secure Authentication**: JWT tokens with HTTP-only cookies
- **Password Encryption**: bcrypt hashing for all passwords
- **Session Management**: Automatic token validation and renewal

### 👥 User Management (SUPERADMIN Only)

- **Create Users**: Add new ADMIN and MEMBER accounts
- **Update Passwords**: Reset passwords for any user
- **Role Management**: Assign and modify user roles
- **User Overview**: View all users with their roles and status

### 📝 Content Management System

- **Database-Driven Content**: All page content stored in MongoDB
- **Admin Interface**: Complete CRUD operations for page content
- **Section Management**: Organize content by page type and section type
- **Image Management**: Upload and manage images for each content section
- **Site Settings**: Configurable site-wide settings with public/private options
- **Real-time Updates**: Content changes reflect immediately on the website

### 🎨 Modern UI/UX

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Hero Sections**: Dynamic image carousels with database-driven content
- **Interactive Elements**: Hover effects, animations, and transitions
- **Professional Layout**: Clean, modern design suitable for luxury real estate

## 🛠️ Tech Stack

- **Frontend**: Next.js 14.2.5, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MongoDB Atlas
- **Authentication**: JWT, bcrypt
- **Styling**: Tailwind CSS
- **Image Handling**: Next.js Image Optimization

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/luxylyfe?retryWrites=true&w=majority"
   JWT_SECRET="your-super-secret-jwt-key-here"
   NEXTAUTH_SECRET="your-nextauth-secret-here"
   ```

3. **Database Setup**

   ```bash
   # Push the database schema
   npx prisma db push

   # Seed properties data
   npx tsx seed-properties.ts

   # Seed content management data
   npx tsx seed-content.ts
   ```

4. **Create Initial Admin User**

   ```bash
   npx tsx create-superadmin.js
   ```

5. **Start Development Server**

   ```bash
   npm run dev
   ```

6. **Access the Application**
   - Website: http://localhost:3000
   - Admin Login: http://localhost:3000/admin-login
   - Member Login: http://localhost:3000/member-login

## 👤 Default Admin Credentials

After running the SUPERADMIN creation script:

- **Email**: newadmin@luxylyfe.com
- **Password**: newadmin123
- **Role**: SUPERADMIN

## 🎯 Key Features in Detail

### Content Management System

The CMS allows administrators to:

- **Edit Hero Sections**: Update titles, subtitles, content, and background images
- **Manage Features**: Add/edit feature sections with icons and descriptions
- **Configure Settings**: Site-wide settings like contact information, timing preferences
- **Image Management**: Upload and organize images for different page sections
- **Real-time Preview**: Changes reflect immediately on the live website

### Admin Dashboard

Access the admin dashboard at `/admin/dashboard` after logging in as ADMIN or SUPERADMIN:

- **Content Management**: Edit all website content through intuitive interface
- **User Management**: Create, update, and manage user accounts (SUPERADMIN only)
- **Property Overview**: Manage property listings and details
- **Settings**: Configure site-wide preferences

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Granular permissions for different user types
- **Password Hashing**: bcrypt encryption for all passwords
- **HTTP-Only Cookies**: Secure token storage
- **Protected Routes**: Middleware protection for admin areas

## 📱 Database Content Management

### Adding Content via Admin Interface

1. Login as ADMIN or SUPERADMIN
2. Navigate to Admin Dashboard
3. Click "Manage Content"
4. Add/Edit content by page type and section
5. Upload images and configure settings
6. Changes appear immediately on the website

### Content Structure

- **Page Types**: HOME, PROJECTS, ABOUT, MISSION, VISION, CONTACT
- **Section Types**: HERO, SECTION, GALLERY, FEATURES, TESTIMONIALS
- **Content Fields**: Title, Subtitle, Content, Images, Order, Active Status

## 🌐 API Endpoints

### Public Endpoints

- `GET /api/content` - Fetch page content and settings
- `GET /api/properties` - List properties with pagination
- `POST /api/auth/login` - User authentication
- `POST /api/auth/signup` - User registration

### Protected Endpoints (Admin/SUPERADMIN)

- `GET/POST/PUT /api/admin/content` - Content management
- `GET/POST /api/admin/settings` - Site settings
- `GET/POST/PUT/DELETE /api/admin/users` - User management (SUPERADMIN only)

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma database browser
- `npx prisma db push` - Push schema changes to database

## 🚀 Deployment

The application is ready for deployment on platforms like Vercel, Netlify, AWS, or Digital Ocean.

### Environment Variables for Production

Ensure these are set in your production environment:

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXTAUTH_SECRET`

---

**LuxyLyfe** - Where Luxury Meets Technology 🏡✨
