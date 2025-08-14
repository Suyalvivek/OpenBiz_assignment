import express from 'express';
import formRoutes from './form-routes.js';
import submissionRoutes from './submission-routes.js';
import schemaRoutes from './schema-routes.js';

export const indexRoute = express.Router();

// Form routes
indexRoute.use('/form', formRoutes);

// Submission routes
indexRoute.use('/submit', submissionRoutes);

// Schema routes
indexRoute.use('/schema', schemaRoutes);
