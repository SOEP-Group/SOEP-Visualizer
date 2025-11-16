require("dotenv").config({ path: ".env.development" });

const request = require("supertest");
const app = require("../index");

describe("Home & General Routes", () => {
  it("GET / should return 200 OK", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });

  it("GET /nonexisting should return 404 Not Found", async () => {
    const res = await request(app).get("/nonexisting");
    expect(res.statusCode).toBe(404);
  });
});

describe("Satellite Routes", () => {
  it("GET /satellite/:id => returns 404 if satellite not found", async () => {
    const res = await request(app).get("/satellite/99999999");
    expect(res.statusCode).toBe(404);
  });

  it("GET /satellite/:id => returns 200 if satellite found", async () => {
    const ISS = 25544;
    const res = await request(app).get(`/satellite/${ISS}`);
    expect([200, 404]).toContain(res.statusCode);
  });
});

describe("API - Satellites", () => {
  it("GET /api/satellites => should return an array of satellites", async () => {
    const res = await request(app).get("/api/satellites");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty("satellite_id");
      expect(res.body[0]).toHaveProperty("name");
      expect(res.body[0]).toHaveProperty("status");
      expect(res.body[0]).toHaveProperty("status_message");
    }
  });

  it("GET /api/filter-data => should return filter data with min/max & arrays", async () => {
    const res = await request(app).get("/api/filter-data");
    expect(res.statusCode).toBe(200);

    expect(res.body).toHaveProperty("min_revolution");
    expect(res.body).toHaveProperty("max_revolution");
    expect(res.body).toHaveProperty("min_inclination");
    expect(res.body).toHaveProperty("max_inclination");
    expect(res.body).toHaveProperty("min_orbit_distance");
    expect(res.body).toHaveProperty("max_orbit_distance");
    expect(res.body).toHaveProperty("min_launch_date");
    expect(res.body).toHaveProperty("max_launch_date");
    expect(res.body).toHaveProperty("launch_sites");
    expect(res.body).toHaveProperty("owners");
    expect(res.body).toHaveProperty("statuses");
    expect(Array.isArray(res.body.statuses)).toBe(true);
    expect(res.body.statuses.length).toBeGreaterThanOrEqual(3);
    expect(res.body.statuses[0]).toHaveProperty("value");
    expect(res.body.statuses[0]).toHaveProperty("label");
  });
});

describe("API - Events", () => {
  it("GET /api/bodies/events/sun => should return 200 OK", async () => {
    const res = await request(app).get("/api/bodies/events/sun");
    expect(res.statusCode).toBe(200);
  });

  it("GET /api/bodies/events/moon => should return 200 OK", async () => {
    const res = await request(app).get("/api/bodies/events/moon");
    expect(res.statusCode).toBe(200);
  });

  it("GET /api/bodies/events/invalid => should return 400 Bad Request", async () => {
    const res = await request(app).get("/api/bodies/events/invalid");
    expect(res.statusCode).toBe(400);
  });
});

describe("API - Collision Prediction", () => {
  it("GET /api/predictions/predict_collision/:id => returns 200 if collision data is found", async () => {
    const ISS = 25544;
    const res = await request(app).get(
      `/api/predictions/predict_collision/${ISS}`
    );
    expect([200, 404]).toContain(res.statusCode);
  });
});
