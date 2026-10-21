// fake credentials for every test; a test can change them with vi.stubEnv,
// which is undone after each test (unstubEnvs in vitest.config.ts)
process.env.PAYPAL_SANDBOX_CLIENT_ID = "fakeClientId";
process.env.PAYPAL_SANDBOX_CLIENT_SECRET = "fakeClientSecret";
// in case the tests run under `paypal dev`, which injects one
delete process.env.PAYPAL_ACCESS_TOKEN;
