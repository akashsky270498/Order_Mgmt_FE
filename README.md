# Distributed Order Management System (Frontend)

A modern, responsive React + Vite frontend for the order management system. Features role-based access control, real-time order tracking, and user profile management.

## 🚀 Features

- **Authentication:** JWT-based login/registration with role selection
- **Admin Dashboard:** User management (activate/deactivate), order tracking, inventory monitoring
- **Customer Portal:** View personal orders, manage profile, change password
- **Real-time Updates:** WebSocket support for live order status updates
- **Responsive Design:** Mobile-friendly interface with theme customization
- **API Integration:** Fully integrated with Django REST Backend via Swagger-documented APIs

## 🛠 Tech Stack

- **Framework:** React 18 with Hooks
- **Build Tool:** Vite
- **HTTP Client:** Axios
- **State Management:** React Context API
- **UI/UX:** Custom CSS with theme support
- **API Docs:** Swagger/OpenAPI integration with backend

## 🏃 Setup Instructions

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone and Install Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file in the frontend root:
   ```
   VITE_API_BASE_URL=http://127.0.0.1:8000/api
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Application will be available at `http://127.0.0.1:5173/`

4. **Build for Production:**
   ```bash
   npm run build
   ```
   Output will be in the `dist/` folder.

## 📁 Project Structure

```
src/
├── components/          # Reusable components (Modal, Layout, etc.)
├── contexts/           # React Context (Auth, Theme, Toast)
├── pages/              # Page components (Login, Dashboard, etc.)
├── services/           # API service layer (authService, orderService, etc.)
├── App.jsx             # Main app routing
└── main.jsx            # Vite entry point
```

## 🔐 Authentication Flow

1. **Public Routes:** Login, Register, Forgot Password
2. **Protected Routes:** Dashboard, Orders, Products, Users, Profile (requires valid JWT token)
3. **Role-Based Routes:** 
   - Admin: Users management page
   - Customer: Orders and Products pages
4. **Token Management:** Refresh token automatically renewed; logout blacklists token on backend

## 🎨 UI Components

- **Layout.jsx** - Main navigation and sidebar
- **Modal.jsx** - Generic modal dialog
- **ConfirmDialog.jsx** - Confirmation prompts
- **EmptyState.jsx** - Empty state placeholders
- **ProtectedRoute.jsx** - Route protection with auth checks

## 🌐 API Integration

All API calls go through the backend at `/api` endpoint. Swagger documentation is available at:
```
http://127.0.0.1:8000/swagger/
```

### Available Services:
- `authService.js` - Login, register, logout, forgot password
- `userService.js` - User management, profile updates, password changes
- `orderService.js` - Create, list, track orders
- `productService.js` - Product inventory management

## ⚖️ Tradeoff Discussions

### Not Deployed to Production
- **Reason:** The backend database hosting on Railway.com failed due to URL/connection configuration issues. Without a reliable hosted database, deploying the frontend separately would create fragmentation and testing complexity.
- **Trade-off:** The complete application can be tested locally with a fully functional backend, Celery workers, and real-time WebSocket support. This provides 100% feature parity with what would be hosted.
- **Current Status:** Follow the Setup Instructions above to run the complete stack locally.

### No Docker Implementation
- **Reason:** The development system has only 8GB of RAM. Docker adds significant memory overhead, causing the system to hang and become unresponsive.
- **Trade-off:** Development is faster and more responsive on the host machine. For production, Docker would be ideal for consistency and scaling.

## 🧪 Testing the Frontend

The frontend integrates fully with the backend. To test the complete application:

1. **Start Backend:**
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Start Celery Worker:**
   ```bash
   celery -A config worker --loglevel=info --pool=solo
   ```

3. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access at:** `http://127.0.0.1:5173/`

## 📝 Development Notes

- All API responses follow the standard format: `{ msg, data, status_code }`
- Toast notifications provide user feedback for all operations
- JWT tokens are stored in localStorage and automatically refreshed
- All forms include client-side validation before API submission
- Error responses are caught and displayed as toast notifications

## 🔗 Related Repositories

- **Backend API:** [Django REST Backend](https://github.com/your-username/your-backend-repo)
  - Includes Swagger API documentation at `/swagger/`
  - **Postman Collection:** `Postman_Collection.json` - Import directly into Postman for full API testing
  - Full async task processing with Celery
  - Complete test suite with pytest
  - All API endpoints documented with examples

## 📄 License

This project is part of a technical assessment for CodeNicely.
