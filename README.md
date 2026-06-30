# Cafe Order Management System

A full-stack order workflow system for a small cafe. Staff take orders at the counter and track them through preparation; kitchen staff manage the queue; admins configure the menu and oversee operations.

Built for IFQ636 Software Lifecycle Management at QUT. Assignment 2 re-engineers the backend into an object-oriented design built around seven design patterns, with unit and API testing and a CI/CD pipeline to AWS EC2.

## Public URL

http://15.135.58.70

## Test Credentials

| Role    | Email           | Password               |
|---------|-----------------|------------------------|
| Staff   | sarah@cafe.com  | Passw0rd!              |
| Kitchen | marcus@cafe.com | Passw0rd!              |
| Admin   | priya@cafe.com  | Passw0rd!              |

## Project Links

- **GitHub:** https://github.com/juhagh/coms-a2
- **Issues & Project board:** https://github.com/users/juhagh/projects/1/views/2
- **Figma Design:** https://www.figma.com/design/tZClfoxjHp6f8yK2r9ytq7/Cafe-Order-Management-System---Designs?node-id=9628-563&t=Lo3nBN9a1f7rRXdD-1
- **SysML Diagrams:** https://github.com/juhagh/coms-a2/blob/main/docs/sysml/CafeOrderManagementSystem-sysml.drawio
- **Postman Collection:** https://github.com/juhagh/coms-a2/tree/main/postman

## Features

- **Menu management** (admin only): create, edit, delete, and toggle availability of menu items across categories Coffee, Breakfast, Lunch, and Pastries. Supports image upload.
- **Order management** (staff): browse menu, build cart with customer type selection, submit orders, track status as it updates, and mark orders as picked up.
- **Kitchen queue** (kitchen): three-column kanban board (New, Preparing, Ready) with 30-second polling and urgency indicators for orders over 15 minutes.
- **Admin dashboard**: order statistics, revenue tracking, quick actions, and order management.
- **User management** (admin): list users, change a user's role, and remove users; any user can change their own password.
- **Role-based access**: staff, kitchen, and admin roles with distinct permissions enforced on both frontend and backend.

## Design Patterns & OOP (Assignment 2)

The backend is organised around seven design patterns, each as a module under `backend/patterns/` with its own Mocha/Chai unit tests:

- **State** - order lifecycle transitions (`draft → submitted → queued → preparing → ready → completed`, plus `cancelled`); illegal transitions are rejected.
- **Factory** - role-based users (staff/kitchen/admin), each carrying its own permission set.
- **Strategy** - order query visibility (by role) and sort order (switchable via `?sort=`).
- **Chain of Responsibility** - order-request validation pipeline (items present → shape → quantity).
- **Singleton** - a single shared application logger.
- **Observer** - order status-change notifications to audit, kitchen, and customer subscribers.
- **Facade** - `OrderService` unifying order placement and status changes behind one interface.

All four OOP principles - abstraction, inheritance, polymorphism, and encapsulation - are applied across these modules. See the project report for detail.

## Tech Stack

- **Frontend:** React, React Router, Axios
- **Backend:** Node.js, Express, JWT, bcrypt, Mongoose
- **Database:** Self-hosted MongoDB 7 (Docker on EC2, bound to 127.0.0.1:27017)
- **Infrastructure:** AWS EC2, Nginx, PM2
- **Testing:** Mocha/Chai (unit), Jest/Supertest (integration), Postman (API)
- **CI/CD:** GitHub Actions

## Local Setup

### Prerequisites

- Node.js 20+ (LTS)
- Docker Desktop
- npm

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/juhagh/coms-a2.git
   cd coms-a2
   ```

2. Start MongoDB locally:

   ```bash
   docker compose up -d
   ```

3. Backend (in a new terminal):

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env: set MONGO_URI and JWT_SECRET
   npm start
   ```

4. Frontend (in a new terminal):

   ```bash
   cd frontend
   npm install
   # Create .env with:
   # REACT_APP_API_URL=http://localhost:5001/api
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Running Tests

```bash
cd backend
npm run test:unit   # 65 Mocha/Chai unit tests (design-pattern logic, no database)
npm test            # Jest/Supertest integration tests (HTTP endpoints + database)
```

## Architecture

- Frontend served by Nginx on port 80
- Backend API proxied via Nginx to `/api` on port 5001
- Self-hosted MongoDB 7 (Docker), bound to `127.0.0.1:27017` and not publicly exposed
- PM2 process manager keeps the backend running and restarts it on failure

## CI/CD Pipeline

Every push to `main` triggers:

1. A MongoDB service is spun up for testing
2. Unit tests (Mocha/Chai) and integration tests (Jest/Supertest) run
3. Frontend build with production environment variables
4. Automated deployment to AWS EC2 via SSH (the host is synced exactly to `origin/main`)
5. PM2 backend restart and Nginx reload