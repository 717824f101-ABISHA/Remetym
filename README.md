# RemeTym
### Intelligent Medicine Stock & Expiry Management System

> **Note:** This is a standalone frontend application. No backend service or database is required.

RemeTym is an AI-based medicine stock and expiry management system built for authorized Government Healthcare personnel (System Administrators, District Health Officers, and Primary Health Centre Staff).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher recommended)

### Installation & Launch

```bash
# 1. Install dependencies
npm install

# 2. Launch the local development server
npm run dev

# 3. Production Build Verification
npm run build
```

---

## 🔑 Demo Access Credentials

The application uses automatic role determination upon login without a role dropdown. You can log in using either email or username:

| Role | Username | Email | Password | Scope / Jurisdiction |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | `admin` | `admin@health.gov.in` | `Admin@123` | National System-Wide View |
| **DHO** | `dho` | `dho@health.gov.in` | `Dho@123` | Central Health District (`DIST-01`) |
| **PHC STAFF** | `phc` | `phc@health.gov.in` | `Phc@123` | Green Valley PHC (`PHC-101`) |

---

## ⚡ Key Business Features & Core Workflow

### 1. PHC-to-PHC Medicine Transfer Workflow
- **Creation**: PHC Staff creates a stock transfer request to receive surplus medicine from another facility in the district.
- **Initial Status**: Request is saved as `PENDING`. Physical stocks at both source and destination facilities remain unchanged at this stage.
- **DHO Review**: DHO receives instant notification and reviews the pending request.
- **DHO Approval**: Upon approval by DHO:
  - Source PHC stock **decreases** by requested quantity.
  - Destination PHC stock **increases** by requested quantity.
  - A permanent audit entry is added to **Transfer History**.
  - Real-time notifications are delivered to PHC Staff and Admin.
- **DHO Rejection**: Upon rejection by DHO:
  - Physical stock quantities remain **unchanged**.
  - Request status is marked `REJECTED`.
  - Notification with DHO remarks is sent to PHC Staff.

### 2. Role-Based Dashboards & Security
- **ADMIN (`/admin/*`)**: System-wide control, medicine master data CRUD, inventory oversight across all districts, batch tracking, transfer monitoring, national reports, and system settings.
- **DHO (`/dho/*`)**: District-scoped oversight, inventory monitoring for district PHCs, transfer request approval/rejection console, transfer history, district reports.
- **PHC STAFF (`/phc/*`)**: Facility-scoped pharmacy inventory, medicine formulary lookup, transfer request creation, "My Requests" tracking, facility transfer history, notifications.

### 3. Expiry & Low-Stock Alerts
- **Batch Tracking**: Categorizes medicine batches into **Safe (>30 days)**, **Expiring Soon (<=30 days)**, and **Expired**.
- **Low Stock Thresholds**: Flags inventory automatically when physical stock falls below minimum safety levels.

### 4. Authentication & Password Recovery
- Session persistence via LocalStorage.
- Forgot Password flow with UUID token generation and interactive 15-minute token validation.

---

## 🛠️ Technology Stack

- **Core**: React 19, Vite, JavaScript (JSX)
- **Routing**: React Router DOM v7
- **UI Icons**: Lucide React
- **Data Visualization**: Recharts
- **Design System**: Vanilla CSS / CSS Modules (Dark Government Healthcare Theme: `#0F172A`, `#111827`, `#1E293B`, `#2563EB`, `#22C55E`, `#F59E0B`, `#EF4444`)
- **State Persistence**: Browser `localStorage`

---

## 📂 Project Structure

```
RemeTym/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── charts/        # StockTrend, ExpiryDistribution, TransferActivity
│   │   ├── common/        # Header, Sidebar, StatCard, AIInsightBanner, Modal
│   │   ├── forms/         # Forms and interactive controls
│   │   ├── layout/        # DashboardLayout wrapper
│   │   └── tables/        # Reusable data tables
│   ├── context/           # AuthContext
│   ├── data/              # dummyData.js (Initial mock datasets)
│   ├── pages/
│   │   ├── admin/         # Admin dashboards and management views
│   │   ├── auth/          # Login, Forgot Password, Reset Password
│   │   ├── dho/           # DHO dashboard & approval console
│   │   ├── phc/           # PHC Staff dashboard, inventory, transfer request
│   │   └── public/        # Landing page
│   ├── routes/            # AppRoutes, ProtectedRoute, RoleBasedRoute
│   ├── services/          # authService, medicineService, inventoryService, requestService, notificationService
│   ├── styles/            # index.css design tokens & responsive utilities
│   ├── utils/             # dateUtils, storageUtils
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
└── README.md
```

---

## 🔒 Verification & Compliance
This application runs 100% offline in the browser. No REST API, backend server, Spring Boot, API Gateway, Eureka, or external database is required.
