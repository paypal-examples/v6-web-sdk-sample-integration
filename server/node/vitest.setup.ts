import { vi } from "vitest";

vi.stubEnv("PAYPAL_SANDBOX_CLIENT_ID", "fakeClientId");
vi.stubEnv("PAYPAL_SANDBOX_CLIENT_SECRET", "fakeClientSecret");
