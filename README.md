# Cafe Order Management System

A full-stack order workflow system for a small cafe. Staff take orders at the counter and track them through preparation; kitchen staff manage the queue; admins configure the menu and oversee operations.

Built for IFQ636 Software Lifecycle Management at QUT.

## Public URL

http://15.135.58.70

## Test Credentials

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Staff   | sarah@cafe.com      | password123 |
| Kitchen | marcus@cafe.com     | password123 |
| Admin   | priya@cafe.com      | password123 |

## Project Links

- **GitHub:** https://github.com/juhagh/CafeOrderManagementSystem_IFQ636
- **JIRA Board:** https://connect-team-wp98fr3y.atlassian.net/jira/software/projects/COMS/boards/3
- **Figma Design:** https://www.figma.com/design/tZClfoxjHp6f8yK2r9ytq7/Cafe-Order-Management-System---Designs?node-id=9628-563&t=Lo3nBN9a1f7rRXdD-1
- **SysML Diagrams:** https://github.com/juhagh/CafeOrderManagementSystem_IFQ636/blob/main/docs/sysml/CafeOrderManagementSystem-sysml.drawio

## Features

- **Menu management** (admin only): create, edit, delete, and toggle availability of menu items across categories Coffee, Breakfast, Lunch, and Pastries. Supports image upload.
- **Order management** (staff): browse menu, build cart with customer type selection, submit orders, track status in real time, and mark orders as picked up.
- **Kitchen queue** (kitchen): three-column kanban board (New, Preparing, Ready) with 30-second polling and urgency indicators for orders over 15 minutes.
- **Admin dashboard**: order statistics, revenue tracking, quick actions, and order management.
- **Role-based access**: staff, kitchen, and admin roles with distinct permissions enforced on both frontend and backend.

## Tech Stack

- **Frontend:** React, React Router, Axios
- **Backend:** Node.js, Express, JWT, bcrypt, Mongoose
- **Database:** Self-hosted MongoDB 7 (Docker on EC2)
- **Infrastructure:** AWS EC2, Nginx, PM2
- **CI/CD:** GitHub Actions

## Local Setup

### Prerequisites

- Node.js 20+ (LTS)
- Docker Desktop
- npm

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/juhagh/CafeOrderManagementSystem_IFQ636.git
   cd CafeOrderManagementSystem_IFQ636
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
npm test
```

## Architecture

- Frontend served by Nginx on port 80
- Backend API proxied via Nginx to `/api` on port 5001
- MongoDB Atlas free tier for production database
- PM2 process manager keeps backend running and restarts on failure

## CI/CD Pipeline

Every push to main triggers:
1. MongoDB service spun up for testing
2. Backend tests (Jest + Supertest): 15 tests across auth, menu, and order APIs
3. Frontend build with production environment variables
4. Automated deployment to AWS EC2 via SSH
5. PM2 backend restart and Nginx reload