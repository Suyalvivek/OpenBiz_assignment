/**
 * Utility functions for file operations
 */

import fs from 'fs/promises';
import path from 'path';
import { ScrapedData, FrontendSchema } from '../types/type';

/**
 * Ensures the output directory exists
 * @param dirPath Path to the output directory
 */
export async function ensureOutputDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Saves the complete scraped data to a JSON file
 * @param outputDir Output directory path
 * @param filename Filename for the output
 * @param data Scraped data to save
 */
export async function saveScrapedData(
  outputDir: string,
  filename: string,
  data: ScrapedData
): Promise<void> {
  const filePath = path.join(outputDir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

/**
 * Saves the frontend-ready schema to a JSON file
 * @param outputDir Output directory path
 * @param filename Filename for the output
 * @param data Frontend schema to save
 */
export async function saveFrontendSchema(
  outputDir: string,
  filename: string,
  data: FrontendSchema
): Promise<void> {
  const filePath = path.join(outputDir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

/**
 * Creates a frontend-ready schema from the complete scraped data
 * @param scrapedData Complete scraped data
 * @returns Frontend-ready schema
 */
export function createFrontendSchema(scrapedData: ScrapedData): FrontendSchema {
  return {
    step1Fields: scrapedData.steps.step1.filter(field => 
      !field.type.includes('hidden') && field.label !== 'No label'
    ),
    step2Fields: scrapedData.steps.step2.filter(field => 
      !field.type.includes('hidden') && field.label !== 'No label'
    ),
    validationRules: scrapedData.validationRules
  };
}