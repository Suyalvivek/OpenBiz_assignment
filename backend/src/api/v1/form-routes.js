import express from 'express';
import { getFormFields, getFormFieldsByStep, getValidationRulesHandler } from '../../controllers/form-controller.js';

const router = express.Router();

// Get all form fields
router.get('/fields', getFormFields);

// Get form fields by step
router.get('/fields/:step', getFormFieldsByStep);

// Get validation rules
router.get('/validation-rules', getValidationRulesHandler);

export default router;