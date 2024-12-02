import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "../../src";
import { startServer, stopServer } from "./setup/server";

describe("Petrix E2E Tests", () => {
  const TEST_PORT = 3333;
  const baseURL = `http://localhost:${TEST_PORT}`;

  beforeAll(async () => {
    await startServer(TEST_PORT);
  });

  afterAll(async () => {
    await stopServer();
  });

  it("should successfully communicate with a real server", async () => {
    const client = createClient({ baseURL });
    const response = await client.get("/test/success");
    expect(response.data).toEqual({ success: true });
  });

  it("should handle POST requests with real data transfer", async () => {
    const client = createClient({ baseURL });
    const testData = { test: "data" };
    const response = await client.post("/test/echo", testData);
    expect(response.data).toEqual(testData);
  });

  it("should handle server errors properly", async () => {
    const client = createClient({ baseURL });
    try {
      await client.get("/test/error");
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.status).toBe(500);
      expect(error.response.data).toEqual({ error: "Server Error" });
    }
  });

  it("should respect timeout settings", async () => {
    const client = createClient({
      baseURL,
      timeout: 500, // Set timeout to 500ms
    });

    try {
      await client.get("/test/delayed"); // This endpoint delays 1000ms
      expect.fail("Should have timed out");
    } catch (error: any) {
      expect(error.code).toBe("TIMEOUT");
    }
  }, 2000); // Set test timeout to 2000ms
});
