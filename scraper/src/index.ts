/**
 * Main entry point for the Udyam form scraper
 */

import path from 'path';
import { scrapeUdyamForm } from './services/scraper';
import { logger } from './utils/logger';
import { config } from './config';
import { ensureOutputDir, saveScrapedData, saveFrontendSchema, createFrontendSchema } from './utils/fileUtils';

/**
 * Main execution function
 */
async function main() {
  try {
    logger.info('Starting Udyam form scraping...');
    const scrapedData = await scrapeUdyamForm();
    
    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), config.output.dir);
    await ensureOutputDir(outputDir);
    
    // Save complete scraped data
    await saveScrapedData(
      outputDir, 
      config.output.fullSchema, 
      scrapedData
    );
    
    // Create and save frontend schema
    const frontendSchema = createFrontendSchema(scrapedData);
    await saveFrontendSchema(
      outputDir, 
      config.output.frontendSchema, 
      frontendSchema
    );
    
    // Log statistics
    logger.success('Scraping complete!');
    logger.stats(
      scrapedData.fields.length,
      scrapedData.steps.step1.length,
      scrapedData.steps.step2.length,
      scrapedData.uiElements.length
    );
    
    // Log saved files
    logger.files([
      `${config.output.dir}/${config.output.fullSchema} (complete data)`,
      `${config.output.dir}/${config.output.frontendSchema} (frontend-ready)`
    ]);
    
  } catch (error) {
    logger.error('Scraping failed:', error);
    process.exit(1);
  }
}

// Execute the main function
main();