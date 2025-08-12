/**
 * Configuration settings for the scraper
 */

export const config = {
  /**
   * URL of the Udyam registration form
   */
  udyamUrl: 'https://udyamregistration.gov.in/UdyamRegistration.aspx',
  
  /**
   * Puppeteer browser launch options
   */
  browser: {
    headless: false, // Set to true for production
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  },
  
  /**
   * Page navigation options
   */
  navigation: {
    waitUntil: 'networkidle2' as 'networkidle2',
    timeout: 30000
  },
  
  /**
   * Selectors for important elements
   */
  selectors: {
    aadhaarInput: '#ctl00_ContentPlaceHolder1_txtadharno',
    nameInput: '#ctl00_ContentPlaceHolder1_txtownername',
    declarationCheckbox: '#ctl00_ContentPlaceHolder1_chkDecarationA',
    validateButton: '#ctl00_ContentPlaceHolder1_btnValidateAadhaar'
  },
  
  /**
   * Test data for form submission
   */
  testData: {
    aadhaar: '123456789012',
    name: 'Test Entrepreneur'
  },
  
  /**
   * Output file paths
   */
  output: {
    dir: 'output',
    fullSchema: 'formSchema.json',
    frontendSchema: 'frontendSchema.json'
  }
};