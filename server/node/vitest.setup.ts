// fake credentials for every test; a test can change them with vi.stubEnv,
// which is undone after each test (unstubEnvs in vitest.config.ts)
process.env.PAYPAL_SANDBOX_CLIENT_ID = "fakeClientId";
process.env.PAYPAL_SANDBOX_CLIENT_SECRET = "fakeClientSecret";
// so an access token in the shell doesn't change what the tests use
delete process.env.PAYPAL_ACCESS_TOKEN;
