import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import apiRoutes from './api/routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'collaboration-scorecard-backend',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api', apiRoutes);

// Serve frontend static files in production
// When compiled, __dirname is backend/dist, so ../frontend-dist points to backend/frontend-dist
const frontendPath = path.join(__dirname, '../frontend-dist');
const indexHtmlPath = path.join(frontendPath, 'index.html');

// Log paths on startup
console.log('Frontend path:', frontendPath);
console.log('Index.html path:', indexHtmlPath);

// Check if frontend exists on startup
if (fs.existsSync(indexHtmlPath)) {
  console.log('✓ Frontend index.html found');
} else {
  console.error('✗ Frontend index.html NOT found at:', indexHtmlPath);
  console.error('Directory contents of frontend-dist:');
  if (fs.existsSync(frontendPath)) {
    console.error(fs.readdirSync(frontendPath));
  } else {
    console.error('frontend-dist directory does not exist');
  }
}

app.use(express.static(frontendPath));

// SPA fallback - serve index.html for non-API routes
app.get('*', (req, res, next) => {
  // Skip API routes and health check
  if (req.path.startsWith('/api') || req.path === '/health') {
    return next();
  }
  res.sendFile(indexHtmlPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(404).json({ error: 'Frontend not found', path: indexHtmlPath });
    }
  });
});

// Error handling (for API routes)
app.use('/api', notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
