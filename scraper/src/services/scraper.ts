/**
 * Main scraper service
 */

import puppeteer from 'puppeteer';
import { ScrapedData, FormField } from '../types/type';
import { config } from '../config';
import { logger } from '../utils/logger';
import { extractFormFields, extractUIElements, extractValidationRules } from './formExtractor';

/**
 * Main function to scrape the Udyam registration form
 * @returns Promise resolving to scraped data
 */
export async function scrapeUdyamForm(): Promise<ScrapedData> {
  const browser = await puppeteer.launch(config.browser);
  const page = await browser.newPage();

  try {
    logger.info('Navigating to Udyam registration page...');
    await page.goto(config.udyamUrl, config.navigation);

    // Wait for the page to fully load
    await page.waitForSelector(config.selectors.aadhaarInput, { timeout: 10000 });

    logger.info('Extracting Step 1 fields...');
    const step1Fields = await extractFormFields(page, 1);
    
    logger.info('Extracting UI elements...');
    const uiElements = await extractUIElements(page);

    logger.info('Extracting validation rules...');
    const validationRules = await extractValidationRules(page);

    // Try to navigate to Step 2 by simulating form interaction
    logger.info('Attempting to access Step 2...');
    let step2Fields: FormField[] = [];
    
    try {
      // Fill in dummy data to proceed to step 2
      await page.type(config.selectors.aadhaarInput, config.testData.aadhaar, { delay: 100 });
      await page.type(config.selectors.nameInput, config.testData.name, { delay: 100 });
      
      // Check the declaration checkbox if it exists
      const checkboxExists = await page.$(config.selectors.declarationCheckbox);
      if (checkboxExists) {
        await page.click(config.selectors.declarationCheckbox);
      }

      // Click validate button
      await page.click(config.selectors.validateButton);
      
      // Wait for potential page changes or new fields
      // Use page.waitForTimeout equivalent
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Try to extract step 2 fields
      step2Fields = await extractFormFields(page, 2);
      
    } catch (error) {
      logger.warning(`Could not access Step 2 automatically: ${(error as Error).message}`);
      logger.warning('Manual inspection might be needed for Step 2 fields');
    }

    const scrapedData: ScrapedData = {
      fields: [...step1Fields, ...step2Fields],
      uiElements,
      validationRules,
      steps: {
        step1: step1Fields,
        step2: step2Fields
      }
    };

    return scrapedData;

  } finally {
    await browser.close();
  }
}