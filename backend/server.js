/**
 * Backend Server
 * Express.js server for Library Membership System
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { testConnection } from './src/config/database.js';
import memberRoutes from './src/routes/memberRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================
// MIDDLEWARE
// ============================================

// CORS configuration
app.use(cors({
  origin: ['http://localhost:8000', 'http://localhost:5173', 'http://127.0.0.1:8000'],
  credentials: true
}));

// Body parser
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// ROUTES
// ============================================

// API Routes
app.use('/api/members', memberRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Library Membership System API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      login: 'POST /api/auth/login',
      verify: 'POST /api/auth/verify',
      logout: 'POST /api/auth/logout',
      register: 'POST /api/members/register',
      getAll: 'GET /api/members',
      getById: 'GET /api/members/:id',
      search: 'GET /api/members/search',
      approve: 'PUT /api/members/:id/approve',
      reject: 'PUT /api/members/:id/reject',
      stats: 'GET /api/members/dashboard/stats'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((error, req, res, next) => {
  console.error('Error:', error);

  // Multer errors
  if (error.code === 'LIMIT_PART_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Terlalu banyak file yang di-upload'
    });
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Ukuran file terlalu besar'
    });
  }

  res.status(500).json({
    success: false,
    message: error.message || 'Terjadi kesalahan pada server'
  });
});

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`\n✅ Backend Server is running on http://localhost:${PORT}`);
      console.log(`📚 API Docs available at http://localhost:${PORT}`);
      console.log(`\n--- Endpoints ---`);
      console.log(`POST   /api/auth/login                 - Login admin`);
      console.log(`POST   /api/auth/verify                - Verify token`);
      console.log(`POST   /api/auth/logout                - Logout admin`);
      console.log(`POST   /api/members/register           - Register new member`);
      console.log(`GET    /api/members                    - Get all members`);
      console.log(`GET    /api/members/:id                - Get member by ID`);
      console.log(`GET    /api/members/search?query=...   - Search members`);
      console.log(`PUT    /api/members/:id/approve        - Approve member`);
      console.log(`PUT    /api/members/:id/reject         - Reject member`);
      console.log(`GET    /api/members/dashboard/stats    - Get statistics\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
