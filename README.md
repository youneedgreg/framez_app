# 📱 Framez - Modern Social Media App

<div align="center">

![Framez Logo](https://img.shields.io/badge/Framez-Social_Media-6366f1?style=for-the-badge&logo=react&logoColor=white)

**A professional-grade social media application built with React Native, TypeScript, and Supabase**

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)

[Live Demo](https://appetize.io/app/your-app-id) • [Report Bug](https://github.com/youneedgreg/framez_app/issues) • [Request Feature](https://github.com/youneedgreg/framez_app/issues)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Demo](#-demo)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Building](#-building-for-production)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 About

**Framez** is a feature-rich social media application that demonstrates modern mobile development best practices. Built for the HNG Internship Stage 4 challenge, it showcases professional-grade UI/UX, complete CRUD operations, real-time data synchronization, and advanced features like theme switching and search functionality.

### 🎨 Design Philosophy

- **User-First**: Intuitive navigation and natural interactions
- **Performance**: Optimized rendering and data fetching
- **Accessibility**: Clear visual hierarchy and responsive design
- **Modern**: Instagram-quality UI with smooth animations

---

## ✨ Features

### Core Functionality

- 🔐 **Secure Authentication**
  - Email/password signup and login
  - Session persistence across app restarts
  - Secure token storage with Expo SecureStore
  - Password visibility toggle

- 🏠 **Dynamic Feed**
  - Real-time post updates with Supabase subscriptions
  - Pull-to-refresh functionality
  - Optimized loading states
  - Beautiful empty states

- 🔍 **Powerful Search**
  - Real-time search as you type (300ms debounce)
  - Search by post content or author name
  - Recent search history (last 5 searches)
  - Smart search result counter

- ➕ **Content Creation**
  - Text posts with 500-character limit
  - Image uploads with cloud storage
  - Combined text and image posts
  - Real-time character counter
  - Image preview and editing

- 👤 **User Profiles**
  - Letter-based avatar generation
  - User statistics (posts, photos, followers)
  - Join date display
  - Personal post gallery

### Advanced Features

- 🌓 **Theme System**
  - Dark and light mode support
  - Instant theme switching
  - Persistent theme preference
  - All screens adapted for both themes

- ⚙️ **Comprehensive Settings**
  - Profile editing
  - Theme customization
  - Privacy policy access
  - Account management
  - Sign out with confirmation

- ✏️ **Post Management**
  - Edit your own posts
  - Delete posts with confirmation
  - Three-dot action menu
  - Permission-based visibility

- ⌨️ **Perfect Keyboard UX**
  - Tap outside to dismiss
  - Scroll to dismiss
  - Natural keyboard behavior

---

## 🎬 Demo

### Live Demo

Try the app live without any downloads:

**[🚀 Launch Framez on Appetize.io](https://appetize.io/app/b_leijd7zx3utcwt2wrtz32pc6ey?device=pixel7&osVersion=13.0&toolbar=true)**

### Test Credentials

Create your own account!

### What to Try

1. 🌓 **Theme Toggle**: Profile → Settings → Toggle Dark Mode
2. 🔍 **Search**: Search tab → Type to search posts
3. ➕ **Create**: Create tab → Share a post with image
4. ✏️ **Edit**: Profile → Tap ⋯ on your post → Edit
5. 🗑️ **Delete**: Profile → Tap ⋯ on your post → Delete

---

## 🛠️ Tech Stack

### Frontend

- **[React Native](https://reactnative.dev/)** - Mobile framework
- **[Expo](https://expo.dev/)** - Development platform
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[React Navigation](https://reactnavigation.org/)** - Navigation library
- **[React Context API](https://react.dev/reference/react/useContext)** - State management

### Backend

- **[Supabase](https://supabase.com/)** - Backend as a Service
  - Authentication
  - PostgreSQL Database
  - Cloud Storage
  - Real-time Subscriptions
  - Row Level Security

### Key Dependencies

```json
{
  "@react-navigation/bottom-tabs": "^6.x",
  "@react-navigation/native": "^6.x",
  "@react-navigation/native-stack": "^6.x",
  "@supabase/supabase-js": "^2.x",
  "expo-image-picker": "~14.x",
  "expo-secure-store": "~12.x",
  "@react-native-async-storage/async-storage": "1.x"
}
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Supabase Account** ([Sign up](https://supabase.com/))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/youneedgreg/framez_app.git
cd framez
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Supabase**

- Create a new project at [Supabase Dashboard](https://supabase.com/dashboard)
- Run the SQL schema (see [Database Setup](#database-setup))
- Create a storage bucket named `post-images` (make it public)

### Environment Setup

1. **Copy the environment template**

```bash
cp .env.example .env
```

2. **Get your Supabase credentials**

- Go to [Supabase Dashboard](https://supabase.com/dashboard)
- Select your project
- Go to **Settings** → **API**
- Copy your **Project URL** and **anon/public** key

3. **Update `.env` file**

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Important**: Never commit your `.env` file!

### Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE USING (auth.uid() = user_id);
```

### Run the App

```bash
# Start Expo development server
npx expo start

# Or run on specific platform
npx expo start --ios
npx expo start --android
npx expo start --web
```

Scan the QR code with Expo Go app (iOS/Android)

---

## 📱 Usage

### Creating an Account

1. Launch the app
2. Tap **"Sign Up"**
3. Enter email, name, and password
4. Tap **"Create Account"**

### Exploring Features

**Feed** 🏠 - Scroll posts, pull to refresh

**Search** 🔍 - Type to search, view recent searches

**Create** ➕ - Write posts, add images

**Profile** 👤 - View stats, manage posts

**Settings** ⚙️ - Toggle dark mode, edit profile

---

## 📁 Project Structure

```
framez/
├── src/
│   ├── contexts/
│   │   ├── AuthContext.tsx          # Authentication state
│   │   └── ThemeContext.tsx         # Theme state
│   ├── screens/
│   │   ├── AuthScreen.tsx           # Login/Signup
│   │   ├── FeedScreen.tsx           # Main feed
│   │   ├── SearchScreen.tsx         # Search
│   │   ├── CreatePostScreen.tsx     # Create posts
│   │   ├── ProfileScreen.tsx        # Profile
│   │   └── SettingsScreen.tsx       # Settings
│   ├── components/
│   │   └── PostCard.tsx             # Post component
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Navigation
│   ├── lib/
│   │   └── supabase.ts              # Supabase client
│   └── types/
│       └── index.ts                 # TypeScript types
├── App.tsx                          # Root component
├── .env                             # Environment variables
├── .env.example                     # Environment template
└── README.md                        # This file
```

---

## 🔌 API Reference

### Authentication

```typescript
// Sign up
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign in
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Sign out
await supabase.auth.signOut();
```

### Posts

```typescript
// Create post
await supabase.from('posts').insert({
  user_id: userId,
  author_name: userName,
  content: 'Post content',
  image_url: 'https://...'
});

// Get all posts
await supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false });

// Update post
await supabase
  .from('posts')
  .update({ content: 'Updated' })
  .eq('id', postId);

// Delete post
await supabase
  .from('posts')
  .delete()
  .eq('id', postId);

// Search posts
await supabase
  .from('posts')
  .select('*')
  .or(`content.ilike.%${query}%,author_name.ilike.%${query}%`);
```

---

## 🏗️ Building for Production

### Android APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Add secrets
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "YOUR_URL"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR_KEY"

# Build
eas build -p android --profile preview
```

---

## 🌐 Deployment

### Appetize.io

1. Build APK using EAS
2. Go to [Appetize.io](https://appetize.io/)
3. Upload your `.apk` file
4. Get your public demo link

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---


## 📧 Contact

**Your Name** - [@youneedgreg](https://linkedin.com/youneedgreg)

**Project**: [github.com/youneedgreg/framez](https://github.com/youneedgreg/framez_app)

**Live Demo**: [appetize.io/app/your-app-id](https://appetize.io/app/b_leijd7zx3utcwt2wrtz32pc6ey?device=pixel7&osVersion=13.0&toolbar=true)

---

## 🙏 Acknowledgments

### Built For
- **[HNG Internship](https://hng.tech/)** - Stage 3 Challenge
- **[HNG Hire](https://hng.tech/hire)** - Connect with talent

### Technologies
- React Native, Expo, Supabase, TypeScript

### Inspiration
- Instagram (UI/UX), Twitter (Search), Reddit (Interactions)

---

<div align="center">

**⭐ Star this repo if you find it useful! ⭐**

Made with ❤️ for HNG Internship

[Report Bug](https://github.com/youneedgreg/framez_app/issues) • [Request Feature](https://github.com/youneedgreg/framez_app/issues)

</div>