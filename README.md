# VibeUp Backend

Backend API for VibeUp app built with Express.js and PostgreSQL.

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **pg** - PostgreSQL client for Node.js

## Project Structure

```
vibeup-backend/
├── src/
│   ├── config/          # Configuration files (database, etc.)
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── database/
│   └── init.sql         # Database initialization script
├── .env.example         # Example environment variables
├── .gitignore
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your configuration:

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vibeup_db
DB_USER=postgres
DB_PASSWORD=your_password_here
CORS_ORIGIN=http://localhost:3000
```

### 3. Set Up PostgreSQL Database

Make sure PostgreSQL is installed and running, then create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE vibeup_db;

# Exit PostgreSQL
\q

# Run initialization script
psql -U postgres -d vibeup_db -f database/init.sql
```

### 4. Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000` (or the PORT you specified in `.env`).

## API Endpoints

### Health Checks

- `GET /health` - Server health check
- `GET /health/db` - Database connection health check
- `GET /api` - API welcome message

### Available Routes

(Add your routes here as you develop them)

## Development

### Adding New Routes

1. Create a route file in `src/routes/`
2. Create corresponding controller in `src/controllers/`
3. Import and use in `src/server.js`

Example:

```javascript
// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);

module.exports = router;
```

```javascript
// In src/server.js
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
```

## Security Features

- **Helmet** - Sets security-related HTTP headers
- **CORS** - Configured for your React frontend
- **Environment Variables** - Sensitive data in `.env` file

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

ISC
