# Product Requirements Document (PRD): SwiftLogistics LaaS Platform

## 1. Project Overview
**SwiftLogistics** is a multi-tenant "Logistics-as-a-Service" (LaaS) platform designed specifically for the Nigerian market. It enables logistics companies to manage orders, riders, and customers in a unified system with strict data isolation.

### 1.1 Goal
Provide a robust, scalable, and multi-tenant solution for logistics operators to digitize their workflows, from order ingestion (WhatsApp) to delivery execution (Rider App).

## 2. Core Modules

### 2.1 Multi-Tenant Administration (Backend)
- **Tenant Isolation**: Every request must include a `x-tenant-id` to ensure data privacy.
- **Role-Based Access**: Support for `Admin`, `Dispatcher`, and `Rider` roles.
- **Audit Logging**: Track order status changes and system interactions.

### 2.2 WhatsApp Order Parsing (Frontend - Dashboard)
- **Input**: Raw text pasted from WhatsApp messages.
- **Parsing Engine**: Regex-based extraction of:
  - Customer Name
  - Phone Number
  - Delivery Item
  - Drop-off Address
- **Staging Area**: Parsed data is reviewed and edited in a staging table before committing to the live database.

### 2.3 Order Management
- **Lifecycle**: Pending → Dispatched → In Progress → Delivered → Cancelled.
- **History**: Full status history for every order.
- **Bulk Uploads**: Support for CSV/Excel and the "Paste & Parse" module.

### 2.4 Rider App (Phase 3 - Upcoming)
- **Offline-First**: Ability to mark deliveries as complete without an active internet connection.
- **Sync Engine**: Automatic background sync when connectivity is restored.
- **Navigation**: Integration with mapping services for delivery routing.

## 3. Technical Stack
- **Frontend**: Vite + React + TypeScript + Tailwind CSS.
- **Backend**: Node.js + Express + TypeScript.
- **Database**: PostgreSQL (with strict `tenant_id` indexing).
- **Architecture**: Modular Monolith with multi-tenancy middleware.

## 4. Roadmap

### Phase 1: Foundation (Complete)
- [x] Backend scaffolding & Multi-tenancy middleware.
- [x] Database schema design & `queryTenant` wrapper.
- [x] Frontend dashboard initialization.
- [x] "Paste & Parse" module implementation.

### Phase 2: Core Integration (Complete)
- [x] Connect live PostgreSQL database.
- [x] Implement Order CRUD API.
- [x] Dispatcher dashboard for order assignment.

### Phase 3: Offline-First Rider App (Complete)
- [x] Mobile-responsive PWA.
- [x] SQLite/IndexedDB (localforage) for offline storage.
- [x] Background sync engine.

### Phase 4: Advanced Features (Not Started)
- [ ] Real-time rider tracking.
- [ ] Automated SMS/Email notifications for customers.
- [ ] Wallet & Rider payout system.

## 5. Success Metrics
- Reduction in manual data entry time (via Paste & Parse).
- High rider adoption (via offline reliability).
- Zero cross-tenant data leakage.

## 6. Design System & Aesthetics (Vortex Theme)
To ensure brand consistency, all UI elements must adhere to the following theme inspired by the "Vortex" sample:

### 6.1 Colors
- **Primary (Brand)**: `#7C3AED` (Vibrant Purple) - Used for primary buttons, active states, and branding.
- **Secondary**: `#C084FC` (Lilac/Soft Purple) - Used for accents, highlights, and secondary gradients.
- **Background**: `#F8FAFC` (Slate 50) with soft radial gradients of `#F5F3FF` (Purple 50).
- **Text (Dark)**: `#0F172A` (Slate 900) - For high contrast headers.
- **Text (Muted)**: `#475569` (Slate 600) - For body text and descriptions.

### 6.2 Style Guidelines
- **Glassmorphism**: Use semi-transparent white backgrounds with backdrop blur for cards and modals.
  - Class: `bg-white/70 backdrop-blur-md border border-white/20 shadow-xl`
- **Typography**: Large, bold headings with generous letter-spacing. Use clean sans-serif (Inter or similar).
- **Borders**: Soft, rounded corners (`rounded-2xl` or `rounded-3xl`) for cards and containers.
