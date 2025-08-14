// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '7778'; // Use different port for testing
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/udyam_test';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};
