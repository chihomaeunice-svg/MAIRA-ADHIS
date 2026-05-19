require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { initializeFirebase } = require('./firebase');
const casesRouter = require('./routes/cases');
const clientsRouter = require('./routes/clients');
const documentsRouter = require('./routes/documents');
const employeesRouter = require('./routes/employees');
const correspondenceRouter = require('./routes/correspondence');
const procurementRouter = require('./routes/procurement');
const reportsRouter = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase
try {
  initializeFirebase();
  console.log('Firebase Admin SDK initialized');
} catch (error) {
  console.warn('Firebase initialization warning:', error.message);
}

// Security middleware
app.use(helmet());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MAIRA & ADHIS ADVOCATES API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/cases', casesRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/correspondence', correspondenceRouter);
app.use('/api/procurement', procurementRouter);
app.use('/api/reports', reportsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`MAIRA & ADHIS ADVOCATES API Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
