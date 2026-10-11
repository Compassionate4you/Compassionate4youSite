// Test-only environment defaults. Real values come from server/.env.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-not-used-outside-tests';
process.env.NODE_ENV = 'test';
