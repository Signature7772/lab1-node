const request = require("supertest");
const app = require("./server");

describe("GET /", () => {
  it("should return Hello World", async () => {
    const res = await request(app).get("/");
    expect(res.text).toBe("Hello World");
  });
});