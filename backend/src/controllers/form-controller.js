import { 
  getAllFields,
  getFieldsByStep,
  getValidationRules
} from '../services/form-service.js';

export const getFormFields = async (req, res) => {
  try {
    const fields = await getAllFields();
    res.json(fields);
  } catch (error) {
    console.error('Error fetching form fields:', error);
    res.status(500).json({ error: 'Failed to fetch form fields' });
  }
};

/**
 * Get form fields by step
 */
export const getFormFieldsByStep = async (req, res) => {
  try {
    const { step } = req.params;
    const fields = await getFieldsByStep(step);
    res.json(fields);
  } catch (error) {
    console.error(`Error fetching form fields for step ${req.params.step}:`, error);
    res.status(error.message === 'Invalid step number' ? 400 : 500)
      .json({ error: error.message || 'Failed to fetch form fields' });
  }
};

/**
 * Get validation rules
 */
export const getValidationRulesHandler = async (req, res) => {
  try {
    const rules = await getValidationRules();
    res.json(rules);
  } catch (error) {
    console.error('Error fetching validation rules:', error);
    res.status(500).json({ error: 'Failed to fetch validation rules' });
  }
};