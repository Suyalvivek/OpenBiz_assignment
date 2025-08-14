import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './utils/db/connection.js';
import { indexRoute } from './api/v1/index.js';  
import notFoundMiddleware from './utils/middlewares/404.js';
import errorHandlerMiddleware from './utils/middlewares/error-handler.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN, // your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // if you need cookies
}));
app.use(express.json());

// API Routes
app.use('/api/v1', indexRoute);

// 404 handler
app.use(notFoundMiddleware);

// Error handler
app.use(errorHandlerMiddleware);

/**
 * Load form schema and validation rules from JSON files
 */
async function loadSchema() {
  try {
    // Check if form fields already exist
    const existingFields = await prisma.formField.count();
    if (existingFields === 0) {
      console.log('Loading form schema...');
      
      // Load form schema
      const schemaPath = path.join(__dirname, '../data/form-schema.json');
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      
      // Insert form fields
      for (const field of schema) {
        await prisma.formField.create({ data: field });
      }
      
      console.log('Form schema loaded successfully');
    }
    
    // Check if validation rules already exist
    const existingRules = await prisma.validationRule.count();
    if (existingRules === 0) {
      console.log('Loading validation rules...');
      
      // Load validation rules
      const rulesPath = path.join(__dirname, '../data/validation-rules.json');
      const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
      
      // Insert validation rules
      for (const [name, pattern] of Object.entries(rules)) {
        await prisma.validationRule.create({
          data: { name, pattern }
        });
      }
      
      console.log('Validation rules loaded successfully');
    }
  } catch (error) {
    console.error('Error loading schema:', error);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Load schema on startup
  await loadSchema();
});

export default app;