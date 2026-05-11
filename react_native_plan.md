# Implementation Plan: React Native Mobile App (Universal)

## 1. Objective
Build a unified React Native mobile application supporting all user roles (Admin, Dispatcher, Rider) with shared codebase and role-based access control.

## 2. Technical Stack
- **Framework**: React Native with Expo (for faster development and easy push notifications).
- **Language**: TypeScript.
- **State Management**: Redux Toolkit or Zustand (for global state).
- **Offline Storage**: SQLite or WatermelonDB (for robust offline-first capabilities).
- **Navigation**: React Navigation.

## 3. Core Features by Role

### 3.1 All Users
- **Multi-Tenant Login**: Authenticate against the backend with tenant isolation.
- **Push Notifications**: Receive alerts for new tasks or updates.

### 3.2 Riders (Phase 3 Extension)
- **Offline Mode**: View assigned orders and mark status changes without internet.
- **Background Sync**: Automatically upload changes when back online.
- **GPS Tracking**: Share real-time location with dispatchers (when active).

### 3.3 Dispatchers
- **Order Overview**: See list of pending and assigned orders.
- **Quick Assignment**: Assign orders to nearby riders.

### 3.4 Admins
- **Dashboard**: High-level metrics (orders delivered, active riders).

## 4. Implementation Steps

### Step 1: Project Initialization
- Run `npx create-expo-app@latest LogMobile`.
- Setup TypeScript and folder structure.

### Step 2: Authentication & Multi-Tenancy
- Implement login screen.
- Store `tenant_id` and JWT token securely using `expo-secure-store`.

### Step 3: Offline Storage Setup
- Integrate SQLite.
- Create tables for `orders` and `status_updates` to match backend schema.

### Step 4: Role-Based Routing
- Setup navigation flows based on user role after login.

### Step 5: Sync Engine
- Implement background tasks to sync local SQLite data with backend REST API.

## 5. Timeline & Resources
- **Est. Duration**: 4-6 weeks for initial version.
- **Priority**: High (after Rider PWA verification).
