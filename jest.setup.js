import { server } from './mocks/server.test';

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// A fresh fake bank API for every test (test/fake-bank.ts), so no request falls through to
// the dev handlers in mocks/handlers.ts and their 500–2000ms random latency.
beforeEach(() => require('@/test/fake-bank').installFakeBank());

// Reset any request handlers that are declared as a part of our tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());

// The provided MSW handlers log every request/response; keep test output readable.
jest.spyOn(console, 'log').mockImplementation(() => {});

// The ScreenSecurity native module doesn't exist under Jest; use its scriptable stand-in.
jest.mock('@/modules/screen-security');
beforeEach(() => {
  jest.requireMock('@/modules/screen-security').resetScreenSecurityMock();
});
