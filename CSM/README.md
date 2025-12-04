# Client Services Manager Portal

A full-stack web application for managing clients, services, and support tickets with a modern UI and SQLite database.

## Features

- **Client Management**: Add, edit, and manage client information
- **Service Management**: Track services for each client
- **Ticket System**: Create and manage support tickets with comments
- **Dashboard**: View statistics and recent activities
- **Authentication**: Secure login system with JWT tokens
- **Modern UI**: Responsive design with a clean interface

## Tech Stack

### Backend
- Node.js with Express.js
- SQLite database (better-sqlite3)
- JWT authentication
- bcryptjs for password hashing

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Vite for build tooling
- Modern CSS with responsive design

## Installation

1. **Install all dependencies** (root, server, and client):
   ```bash
   npm run install-all
   ```

   Or install manually:
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

2. **Set up environment variables** (optional):
   ```bash
   cd server
   cp .env.example .env
   ```
   Edit `.env` and set your `JWT_SECRET` and `PORT` if needed.

## Running the Application

### Development Mode (runs both server and client):
```bash
npm run dev
```

### Or run separately:

**Backend Server:**
```bash
npm run server
```
Server runs on `http://localhost:5000`

**Frontend Client:**
```bash
npm run client
```
Client runs on `http://localhost:3000`

## Default Login Credentials

- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Important:** Change the default password in production!

## Database

The application uses SQLite database (`server/database/csm.db`). The database is automatically created and initialized when the server starts.

### Database Schema

- **users**: User accounts and authentication
- **clients**: Client information
- **services**: Services associated with clients
- **tickets**: Support tickets linked to services
- **ticket_comments**: Comments on tickets

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get single client
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get single service
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Tickets
- `GET /api/tickets` - Get all tickets
- `GET /api/tickets/:id` - Get ticket with comments
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/comments` - Add comment to ticket
- `DELETE /api/tickets/:id` - Delete ticket

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Project Structure

```
CSM/
├── server/
│   ├── database/
│   │   └── db.js          # Database setup and schema
│   ├── middleware/
│   │   └── auth.js        # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js        # Authentication routes
│   │   ├── clients.js     # Client routes
│   │   ├── services.js    # Service routes
│   │   ├── tickets.js     # Ticket routes
│   │   └── dashboard.js   # Dashboard routes
│   ├── index.js           # Server entry point
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context (Auth)
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   └── package.json
└── package.json           # Root package.json
```

## Development Notes

- The database file (`csm.db`) is created automatically in `server/database/`
- All API routes (except `/api/auth/login`) require authentication
- JWT tokens are stored in localStorage on the client
- The frontend proxies API requests to the backend during development

## Production Deployment

1. Build the frontend:
   ```bash
   cd client
   npm run build
   ```

2. Set environment variables in production
3. Use a production-ready database (PostgreSQL, MySQL) instead of SQLite
4. Configure proper CORS settings
5. Use environment variables for sensitive data

## License

ISC

