// fake credentials for every test; a test can change them with vi.stubEnv,
// which is undone after each test (unstubEnvs in vitest.config.ts)
process.env.PAYPAL_SANDBOX_CLIENT_ID = "fakeClientId";
process.env.PAYPAL_SANDBOX_CLIENT_SECRET = "fakeClientSecret";
// so `paypal dev` variables in the shell don't change what the tests use
delete process.env.PAYPAL_ACCESS_TOKEN;
delete process.env.PAYPAL_CLIENT_ID;
