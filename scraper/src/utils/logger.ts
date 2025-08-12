/**
 * Logger utility for consistent logging
 */

/**
/**
 * Logger class for consistent logging
 */
class Logger {
  /**
   * Log an informational message
   * @param message Message to log
   */
  info(message: string): void {
    console.log(`${message}`);
  }

  /**
   * Log a success message
   * @param message Message to log
   */
  success(message: string): void {
    console.log(`${message}`);
  }

  /**
   * Log a warning message
   * @param message Message to log
   */
  warning(message: string): void {
    console.log(`${message}`);
  }

  /**
   * Log an error message
   * @param message Message to log
   * @param error Optional error object
   */
  error(message: string, error?: any): void {
    console.error(`${message}`, error || '');
  }

  /**
   * Log statistics about the scraped data
   * @param totalFields Total number of fields
   * @param step1Fields Number of fields in step 1
   * @param step2Fields Number of fields in step 2
   * @param uiElements Number of UI elements
   */
  stats(totalFields: number, step1Fields: number, step2Fields: number, uiElements: number): void {
    console.log('Statistics:');
    console.log(`   - Total fields found: ${totalFields}`);
    console.log(`   - Step 1 fields: ${step1Fields}`);
    console.log(`   - Step 2 fields: ${step2Fields}`);
    console.log(`   - UI elements: ${uiElements}`);
  }

  /**
   * Log information about saved files
   * @param files Array of file paths
   */
  files(files: string[]): void {
    console.log('Files saved:');
    files.forEach(file => console.log(`   - ${file}`));
  }
}

// Export a singleton instance
export const logger = new Logger();