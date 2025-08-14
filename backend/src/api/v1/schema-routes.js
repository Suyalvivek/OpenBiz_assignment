import express from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

const router = express.Router();

// Get form schema
router.get('/form-schema', (req, res) => {
  try {
    // Use environment variable for schema path, fallback to local path
    const schemaPath = process.env.SCHEMA_PATH 
      ? join(process.env.SCHEMA_PATH, 'frontendSchema.json')
      : join(process.cwd(), '../scraper/output/frontendSchema.json');
    
    const schemaData = readFileSync(schemaPath, 'utf8');
    const schema = JSON.parse(schemaData);
    
    res.json(schema);
  } catch (error) {
    console.error('Error reading form schema:', error);
    res.status(500).json({ 
      error: 'Failed to load form schema',
      details: error.message 
    });
  }
});

// Get validation rules
router.get('/validation-rules', (req, res) => {
  try {
    // Use environment variable for schema path, fallback to local path
    const schemaPath = process.env.SCHEMA_PATH 
      ? join(process.env.SCHEMA_PATH, 'formSchema.json')
      : join(process.cwd(), '../scraper/output/formSchema.json');
    
    const schemaData = readFileSync(schemaPath, 'utf8');
    const schema = JSON.parse(schemaData);
    
    // Extract validation rules
    const validationRules = schema.validationRules || {};
    
    res.json(validationRules);
  } catch (error) {
    console.error('Error reading validation rules:', error);
    res.status(500).json({ 
      error: 'Failed to load validation rules',
      details: error.message 
    });
  }
});

export default router;
